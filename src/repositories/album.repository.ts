import {jsonArrayFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {IAlbum, IAlbumExt, NewAlbum} from '../models/album';
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

  get = async (id: number): Promise<IAlbumExt | undefined> => {
    return await db
      .selectFrom('album')
      .selectAll()
      .select(eb => [
        jsonArrayFrom(
          eb
            .selectFrom('track')
            .selectAll('track')
            .limit(5)
            .where('track.album_id', '=', id)
        ).as('tracks'),
      ])
      .where('album.id', '=', id)
      .executeTakeFirst();
  };
}
