import {DB_HOST, DB_NAME, DB_PWD, DB_USER, DB_PORT} from '../env';
import {FileMigrationProvider, Kysely, Migrator, PostgresDialect, KyselyPlugin, PluginTransformQueryArgs, PluginTransformResultArgs, QueryResult} from 'kysely';
import {Pool} from 'pg';
import {promises as fs} from 'node:fs';
import * as path from 'node:path';
import {UserTable} from '../../models/user';
import {AlbumTable} from '../../models/album';
import {ArtistTable} from '../../models/artist';
import {ArtistAlbumTable} from '../../models/artist_album';
import {PlaylistTrackTable} from '../../models/playlist_track';
import {TrackTable} from '../../models/track';
import {PlaylistTable} from '../../models/playlist';
import {CategoryTable} from '../../models/category';
import {FileTable} from '../../models/file';
import MeasureRequestTime from '../../middleware/request-timer.middleware';

interface Database {
  user: UserTable;
  album: AlbumTable;
  artist: ArtistTable;
  artist_album: ArtistAlbumTable;
  playlist_track: PlaylistTrackTable;
  track: TrackTable;
  playlist: PlaylistTable;
  category: CategoryTable;
  file: FileTable;
}

const queryPlugin: KyselyPlugin = {
  transformQuery: (args: PluginTransformQueryArgs) => {
    const start = Date.now();
    try {
      return args.node;
    } finally {
      const duration = Date.now() - start;
      MeasureRequestTime.addDbQueryTime(duration);
    }
  },
  transformResult: async (args: PluginTransformResultArgs) => {
    const start = Date.now();
    try {
      return args.result;
    } finally {
      const duration = Date.now() - start;
      MeasureRequestTime.addDbQueryTime(duration);
    }
  }
};

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: DB_NAME,
      host: DB_HOST,
      user: DB_USER,
      port: Number(DB_PORT),
      password: DB_PWD,
      max: 10,
    }),
  }),
  plugins: [queryPlugin]
});

export async function migrateToLatest() {
  const migrationDb = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        database: DB_NAME,
        host: DB_HOST,
        user: DB_USER,
        port: Number(DB_PORT),
        password: DB_PWD,
      }),
    }),
  });

  const migrator = new Migrator({
    db: migrationDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '/migrations'),
    }),
  });

  const {error, results} = await migrator.migrateToLatest();

  results?.forEach(it => {
    if (it.status === 'Success') {
      console.info(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await migrationDb.destroy();
}
