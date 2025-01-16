import {jsonObjectFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {ITrack, ITrackExt, NewTrack, TrackUpdate} from '../models/track';
import {EEntityType} from '../models/enums/entityType';
import {EFileType} from '../models/enums/fileType';

export default class TrackRepository {
  create = async (track: NewTrack): Promise<ITrack> => {
    const newTrack = await db.transaction().execute(async trx => {
      const t = await db
        .insertInto('track')
        .values(track)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (track.picture) {
        await trx
          .updateTable('file')
          .set({
            entityId: t.id,
            entityTypeId: EEntityType.TRACK,
          })
          .where('file.id', '=', track.picture)
          .where('file.fileType', '=', EFileType.IMAGE)
          .execute();
      }

      await trx
        .updateTable('file')
        .set({
          entityId: t.id,
          entityTypeId: EEntityType.TRACK,
        })
        .where('file.id', '=', track.audio)
        .where('file.fileType', '=', EFileType.AUDIO)
        .execute();

      return t;
    });

    return newTrack;
  };

  getById = async (id: number): Promise<ITrackExt | undefined> => {
    return await db
      .selectFrom('track')
      .selectAll('track')
      .select(eb => [
        jsonObjectFrom(
          eb
            .selectFrom('album')
            .selectAll('album')
            .whereRef('album.id', '=', 'track.album_id')
        ).as('album'),
        jsonObjectFrom(
          eb
            .selectFrom('category')
            .selectAll('category')
            .whereRef('category.id', '=', 'track.category_id')
        ).as('category'),
        jsonObjectFrom(
          eb
            .selectFrom('artist')
            .selectAll('artist')
            .innerJoin('artist_album', 'artist_album.artist_id', 'artist.id')
            .whereRef('artist_album.album_id', '=', 'track.album_id')
        ).as('artist'),
      ])
      .where('track.id', '=', id)
      .executeTakeFirst();
  };

  getAllWithFilters = async (options?: {
    artistId?: number;
    albumId?: number;
    category?: number;
    releaseDate?: Date;
    minDuration?: number;
    maxDuration?: number;
    playlistId?: number;
    maxNumberOfPlays?: number;
    minNumberOfPlays?: number;
  }): Promise<ITrack[]> => {
    let query = db.selectFrom('track').selectAll();

    if (options?.artistId) {
      query = query
        .innerJoin('album', 'album.id', 'track.album_id')
        .innerJoin('artist_album', 'artist_album.album_id', 'album.id')
        .where('artist_album.artist_id', '=', options.artistId);
    }

    if (options?.albumId) {
      query = query.where('track.album_id', '=', options.albumId);
    }

    if (options?.category) {
      query = query.where('track.category_id', '=', options.category);
    }

    if (options?.releaseDate) {
      query = query.where('track.releaseDate', '=', options.releaseDate);
    }

    if (options?.playlistId) {
      query = query
        .innerJoin('playlist_track', 'playlist_track.track_id', 'track.id')
        .where('playlist_track.playlist_id', '=', options.playlistId);
    }

    if (options?.minDuration) {
      query = query.where('track.duration', '>=', options.minDuration);
    }

    if (options?.maxDuration) {
      query = query.where('track.duration', '<=', options.maxDuration);
    }

    if (options?.minNumberOfPlays) {
      query = query.where(
        'track.number_of_plays',
        '>=',
        options.minNumberOfPlays
      );
    }

    if (options?.maxNumberOfPlays) {
      query = query.where(
        'track.number_of_plays',
        '<=',
        options.maxNumberOfPlays
      );
    }
    query = query.orderBy('track.number_of_plays', 'desc');
    query = query.orderBy('track.title', 'asc');

    return await query.execute();
  };

  deleteById = async (id: number): Promise<void> => {
    await db.deleteFrom('track').where('id', '=', id).execute();
  };

  updateById = async (id: number, track: TrackUpdate): Promise<TrackUpdate> => {
    return await db
      .updateTable('track')
      .set(track)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  };
}
