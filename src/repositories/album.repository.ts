import {jsonArrayFrom, jsonObjectFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {AlbumExt, IAlbum, IAlbumExt, NewAlbum} from '../models/album';
import {EEntityType} from '../models/enums/entityType';
import {EFileType} from '../models/enums/fileType';

export default class AlbumRepository {
  create = async (album: NewAlbum): Promise<IAlbum> => {
    const newAlbum = await db.transaction().execute(async trx => {
      const a = await trx
        .insertInto('album')
        .values(album)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (album.picture) {
        await trx
          .updateTable('file')
          .set({
            entityId: a.id,
            entityTypeId: EEntityType.ALBUM,
          })
          .where('file.id', '=', album.picture)
          .where('file.fileType', '=', EFileType.IMAGE)
          .execute();
      }
      return a;
    });

    return newAlbum;
  };

  getById = async (id: number): Promise<IAlbumExt | undefined> => {
    return await db
      .selectFrom('album')
      .selectAll()
      .select(eb => [
        jsonArrayFrom(
          eb
            .selectFrom('track')
            .selectAll('track')
            .limit(20)
            .where('track.album_id', '=', id)
        ).as('tracks'),
        jsonObjectFrom(
          eb
            .selectFrom('artist_album')
            .innerJoin('artist', 'artist.id', 'artist_album.artist_id')
            .selectAll('artist')
            .where('artist_album.album_id', '=', id)
        ).as('artist'),
      ])
      .where('album.id', '=', id)
      .executeTakeFirst();
  };

  getAll = async (options?: {
    artistId?: number;
    category?: number;
    releaseDate?: Date;
  }): Promise<IAlbum[]> => {
    let query = db.selectFrom('album').selectAll();

    if (options?.artistId) {
      query = query
        .innerJoin('artist_album', 'artist_album.album_id', 'album.id')
        .where('artist_album.artist_id', '=', options.artistId);
    }

    if (options?.category) {
      query = query.where('album.category_id', '=', options.category);
    }

    if (options?.releaseDate) {
      query = query.where('album.releaseDate', '=', options.releaseDate);
    }

    return await query.execute();
  };
}
