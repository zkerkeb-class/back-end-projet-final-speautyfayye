import {jsonArrayFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {IPlaylist, IPlaylistExt, NewPlaylist} from '../models/playlist';

export default class PlaylistRepository {
  create = async (playlist: NewPlaylist): Promise<IPlaylist> => {
    console.log('🚀 ~ PlaylistRepository ~ create= ~ playlist:', playlist);
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
            .selectAll('track')
            // .limit(20)
            .where('track.album_id', '=', id)
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
}
