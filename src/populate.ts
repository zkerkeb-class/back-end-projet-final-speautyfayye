import {Kysely, PostgresDialect} from 'kysely';
import {AlbumTable} from './models/album';
import {ArtistTable} from './models/artist';
import {ArtistAlbumTable} from './models/artist_album';
import {CategoryTable} from './models/category';
import {FileTable} from './models/file';
import {PlaylistTable} from './models/playlist';
import {PlaylistTrackTable} from './models/playlist_track';
import {TrackTable} from './models/track';
import {UserTable} from './models/user';
import {Pool} from 'pg';
import {DB_HOST, DB_NAME, DB_PORT, DB_PWD, DB_USER} from './config/env';

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

const test = async () => {
  const db = new Kysely<Database>({
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
};

test();
