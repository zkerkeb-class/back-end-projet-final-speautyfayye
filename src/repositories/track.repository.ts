import {jsonObjectFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {ITrack, ITrackExt, NewTrack} from '../models/track';
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
      .selectAll()
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
      ])
      .where('track.id', '=', id)
      .executeTakeFirst();
  };
}
