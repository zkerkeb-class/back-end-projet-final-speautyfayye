import {jsonArrayFrom, jsonObjectFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {AlbumUpdate, IAlbum, IAlbumExt, NewAlbum} from '../models/album';
import {EEntityType} from '../models/enums/entityType';
import {EFileType} from '../models/enums/fileType';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';

export default class AlbumRepository {
  create = async (album: NewAlbum): Promise<IAlbum> => {
    try {
      return await db.transaction().execute(async trx => {
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
    } catch (error) {
      const hasMessage = 'message' in (error as any);
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `Error while creating album: ${hasMessage ? (error as any).message : ''}`,
      });
    }
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
    sortBy?: 'releaseDate' | 'trackCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<IAlbum[]> => {
    if (options?.sortBy === 'trackCount') {
      let query = db
        .selectFrom('album')
        .leftJoin('track', 'track.album_id', 'album.id')
        .select(['album.id', 'album.title', 'album.releaseDate', 'album.category_id', 'album.picture'])
        .select(eb => eb.fn.count('track.id').as('trackCount'))
        .groupBy(['album.id', 'album.title', 'album.releaseDate', 'album.category_id', 'album.picture']);

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

      return query.orderBy('trackCount', options.sortOrder || 'desc').execute();
    } else {
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

      if (options?.sortBy === 'releaseDate') {
        query = query.orderBy('releaseDate', options.sortOrder || 'desc');
      }

      return query.execute();
    }
  };

  deleteById = async (id: number): Promise<void> => {
    try {
      await db.deleteFrom('album').where('id', '=', id).execute();
    } catch (error) {
      const hasMessage = 'message' in (error as any);
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `Error while deleting album: ${hasMessage ? (error as any).message : ''}`,
      });
    }
  };

  updateById = async (id: number, album: AlbumUpdate): Promise<AlbumUpdate> => {
    try {
      return await db
        .updateTable('album')
        .set(album)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();
    } catch (error) {
      const hasMessage = 'message' in (error as any);
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `Error while deleting album: ${hasMessage ? (error as any).message : ''}`,
      });
    }
  };
}
