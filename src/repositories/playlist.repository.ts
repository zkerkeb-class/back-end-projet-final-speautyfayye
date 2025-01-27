import {jsonArrayFrom, jsonObjectFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {
  IPlaylist,
  IPlaylistExt,
  NewPlaylist,
  PlaylistUpdate,
} from '../models/playlist';

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
                  .innerJoin(
                    'artist_album',
                    'artist_album.artist_id',
                    'artist.id'
                  )
                  .whereRef('artist_album.album_id', '=', 'track.album_id')
                  .groupBy('track.id')
              ).as('artist'),
            ])
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
    const playlists = await db
      .selectFrom('playlist')
      .selectAll('playlist')
      .select(eb => [
        jsonArrayFrom(
          eb
            .selectFrom('track')
            .innerJoin('playlist_track', 'track.id', 'playlist_track.track_id')
            .whereRef('playlist_track.playlist_id', '=', 'playlist.id')
            .select(['track.picture'])
            .where('track.picture', 'is not', null)
            .limit(4)
        ).as('tracks'),
      ])
      .execute();

    console.log(
      '🚀 ~ PlaylistRepository ~ getAll= ~ playlists:',
      playlists.map(p => p.tracks)
    );
    return playlists;
  };

  deleteById = async (id: number): Promise<void> => {
    await db.deleteFrom('playlist').where('id', '=', id).execute();
  };

  updateById = async (
    id: number,
    playlist: PlaylistUpdate
  ): Promise<IPlaylist> => {
    return await db
      .updateTable('playlist')
      .set(playlist)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  };
}
