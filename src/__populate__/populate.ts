import {Kysely, PostgresDialect} from 'kysely';
import {AlbumTable} from '../models/album';
import {ArtistTable} from '../models/artist';
import {ArtistAlbumTable} from '../models/artist_album';
import {CategoryTable} from '../models/category';
import {FileTable} from '../models/file';
import {PlaylistTable} from '../models/playlist';
import {PlaylistTrackTable} from '../models/playlist_track';
import {TrackTable} from '../models/track';
import {UserTable} from '../models/user';
import {Pool} from 'pg';
import {DB_HOST, DB_NAME, DB_PORT, DB_PWD, DB_USER} from '../config/env';
import fs from 'node:fs';
import {faker} from '@faker-js/faker';
import {randomInt, randomUUID} from 'node:crypto';
import path from 'node:path';
import {EFileType} from '../models/enums/fileType';
import {EEntityType} from '../models/enums/entityType';
const m = import('music-metadata');

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

interface IAudioMetadata {
  common?: {
    artists?: string[];
    artist?: string;
    title?: string;
    album?: string;
    genre?: string[];
    year?: number;
    date?: string;
  };
  format?: {
    duration?: number;
  };
}

const populate = async () => {
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

  const categories: {id?: number; name: string}[] = [];
  const artists: {id?: number; name: string}[] = [];
  const albums: {id?: number; artist_id: number; name: string}[] = [];
  const tracks: {
    id?: number;
    artist_id: number;
    name: string;
    album_id: number;
  }[] = [];

  const directory = `${__dirname}/audios/`;

  let count = 0;
  fs.readdir(directory, async (err, files) => {
    if (err) {
      console.error('Erreur lors de la lecture du répertoire:', err);
      return;
    }
    if (files.some(file => !file.endsWith('.mp3'))) {
      console.error('Fichier mp3 seulement');
      return;
    }

    const parseFile = (await m).parseFile;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const {common, format}: IAudioMetadata = await parseFile(
        directory + file
      );
      if (!common.date) {
        common.date = `${common.year ?? new Date().getFullYear()}0101`; // format YYYYMMDD
      }
      const year = parseInt(common.date.substring(0, 4), 10);
      const month = parseInt(common.date.substring(4, 6), 10) - 1;
      const day = parseInt(common.date.substring(6, 8), 10);
      const releaseDate = new Date(year, month, day);

      const categoryName = common.genre?.at(0) ?? faker.music.genre();
      let category_id = await createCategory(db, categories, categoryName);

      const artistName =
        common.artist ??
        common.artists?.at(0)?.split('/').at(0) ?? // format " [ 'artist1/artist2' ] "
        faker.music.genre();
      let artist_id = await createArtist(db, artists, artistName, category_id);

      common.artists
        ?.at(0)
        ?.split('/')
        ?.forEach(
          async artist => await createArtist(db, artists, artist, category_id)
        );

      const albumName = common.album ?? faker.music.album();
      let album_id = await createAlbum(
        db,
        albums,
        albumName,
        artist_id,
        category_id,
        releaseDate
      );

      const trackName = common.title ?? faker.music.songName();
      const audioId = randomUUID();
      await createTrack(
        db,
        tracks,
        trackName,
        artist_id,
        category_id,
        album_id,
        releaseDate,
        1,
        audioId,
        format.duration
      );

      const buffer = await fs.promises.readFile(directory + file);
      fs.writeFileSync(
        path.join(directory, '../../../ressources/audios/', audioId + '.mp3'),
        buffer
      );
      fs.unlinkSync(path.join(directory, file));

      count++;
    }
    console.log('files processed:', count);
    await createRandomUsers(db, 10, files.length);
  });
};

populate();

const createCategory = async (
  db: Kysely<Database>,
  categories: {id?: number; name: string}[],
  name: string
) => {
  if (categories.some(category => category.name === name)) {
    return (
      Array.from(categories).find(category => category.name === name)?.id ?? 0
    );
  } else {
    const dbCategory = await db
      .insertInto('category')
      .values({name: name})
      .returningAll()
      .executeTakeFirstOrThrow();
    categories.push({name: name, id: dbCategory.id});
    return dbCategory.id;
  }
};

const createArtist = async (
  db: Kysely<Database>,
  artists: {id?: number; name: string}[],
  name: string,
  category_id: number
) => {
  if (artists.some(artist => artist.name === name)) {
    return Array.from(artists).find(artist => artist.name === name)?.id ?? 0;
  } else {
    const dbArtist = await db
      .insertInto('artist')
      .values({name: name, bio: faker.lorem.sentences(), category_id})
      .returningAll()
      .executeTakeFirstOrThrow();
    artists.push({name: name, id: dbArtist.id});
    return dbArtist.id;
  }
};

const createAlbum = async (
  db: Kysely<Database>,
  albums: {id?: number; artist_id: number; name: string}[],
  name: string,
  artist_id: number,
  category_id: number,
  releaseDate: Date
) => {
  if (
    albums.some(album => album.name === name && album.artist_id === artist_id)
  ) {
    return (
      Array.from(albums).find(
        album => album.name === name && album.artist_id === artist_id
      )?.id ?? 0
    );
  } else {
    const dbAlbum = await db
      .insertInto('album')
      .values({title: name, category_id, releaseDate})
      .returningAll()
      .executeTakeFirstOrThrow();
    albums.push({name: name, id: dbAlbum.id, artist_id});

    await db
      .insertInto('artist_album')
      .values({album_id: dbAlbum.id, artist_id})
      .execute();

    return dbAlbum.id;
  }
};

const createTrack = async (
  db: Kysely<Database>,
  tracks: {id?: number; artist_id: number; name: string; album_id: number}[],
  name: string,
  artist_id: number,
  category_id: number,
  album_id: number,
  releaseDate: Date,
  trackNumber: number,
  audio: string,
  duration?: number
) => {
  if (
    tracks.some(
      track =>
        track.name === name &&
        track.artist_id === artist_id &&
        track.album_id === album_id
    )
  ) {
    return (
      Array.from(tracks).find(
        track =>
          track.name === name &&
          track.artist_id === artist_id &&
          track.album_id === album_id
      )?.id ?? 0
    );
  } else {
    const number_of_plays = randomInt(50, 1000); //à modifier lors de l'insertion track
    const dbTrack = await db
      .insertInto('track')
      .values({
        title: name,
        category_id,
        releaseDate,
        album_id,
        audio,
        duration,
        trackNumber,
        number_of_plays,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    tracks.push({name: name, id: dbTrack.id, artist_id, album_id});

    await db
      .insertInto('file')
      .values({
        fileType: EFileType.AUDIO,
        id: audio,
        entityId: dbTrack.id,
        entityTypeId: EEntityType.TRACK,
      })
      .execute();
    return dbTrack.id;
  }
};

const createRandomUsers = async (
  db: Kysely<Database>,
  number: number,
  fileLength: number
) => {
  for (let i = 0; i < number; i++) {
    const user = await db
      .insertInto('user')
      .values({
        email: faker.internet.email(),
        password: faker.internet.password(),
        username: faker.internet.username(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const playlist = await db
      .insertInto('playlist')
      .values({
        title: faker.lorem.words(),
        user_id: user?.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const chosenNumbers = new Set();
    for (let j = 0; j < 6; j++) {
      let randomNumber;
      do {
        randomNumber = randomInt(1, fileLength - 1);
      } while (chosenNumbers.has(randomNumber));
      chosenNumbers.add(randomNumber);

      await db
        .insertInto('playlist_track')
        .values({
          playlist_id: playlist.id,
          track_id: randomNumber,
        })
        .execute();
    }
  }
};
