import {jsonArrayFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {IPlaylist, IPlaylistExt, NewPlaylist, PlaylistUpdate} from '../models/playlist';

export default class PlaylistRepository {
  create = async (playlist: NewPlaylist): Promise<IPlaylist> => {
    return await db
      .insertInto('playlist')
      .values(playlist)
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  getById = async (id: number): Promise<IPlaylistExt | undefined> => {
    return await db
      .selectFrom('playlist')
      .selectAll()
      .where('playlist.id', '=', id)
      .select(eb => [
        jsonArrayFrom(
          eb
            .selectFrom('track')
            .innerJoin('playlist_track', 'track.id', 'playlist_track.track_id')
            .where('playlist_track.playlist_id', '=', id)
            .selectAll('track')
            .limit(20)
        ).as('tracks'),
      ])
      .executeTakeFirst();
  };

  getByUserId = async (userId: number): Promise<IPlaylist[]> => {
    return db
      .selectFrom('playlist')
      .selectAll()
      .where('playlist.user_id', '=', userId)
      .execute();
  };

  getAll = async (): Promise<IPlaylist[]> => {
    return db.selectFrom('playlist').selectAll().execute();
  };

  deleteById = async (id: number): Promise<void> => {
    await db.deleteFrom('playlist').where('id', '=', id).execute();
  };

  updateById = async (id: number, playlist: PlaylistUpdate): Promise<IPlaylist> => {
    return await db
      .updateTable('playlist')
      .set(playlist)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  };
}
