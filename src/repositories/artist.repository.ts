import {db} from '../config/db/db';
import {ArtistUpdate, IArtist, NewArtist} from '../models/artist';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';

export default class ArtistRepository {
  async getAllArtists(option?: {category_id?: number}): Promise<IArtist[]> {
    let query = db.selectFrom('artist').selectAll();

    if (option?.category_id) {
      query = query.where('category_id', '=', option.category_id);
    }

    query = query.orderBy('artist.name', 'asc');
    if (option?.category_id) {
      query = query.where('category_id', '=', option.category_id);
    }

    return await query.execute();
  }

  async getArtistById(id: number): Promise<IArtist | undefined> {
    return await db
      .selectFrom('artist')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async getAristByName(name: string) {
    return await db
      .selectFrom('artist')
      .where('name', '=', name)
      .selectAll()
      .executeTakeFirst();
  }

  async createArtist(data: NewArtist) {
    try {
      return await db
        .insertInto('artist')
        .values({
          name: data.name,
          category_id: data.category_id,
          bio: data.bio,
          picture: data.picture,
        })
        .returningAll()
        .execute();
    } catch (error) {
      const hasMessage = 'message' in (error as any);
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `Error while creating artist: ${hasMessage ? (error as any).message : ''}`,
      });
    }
  }

  async updateById(id: number, data: ArtistUpdate) {
    try {
      return await db
        .updateTable('artist')
        .set({
          name: data.name,
          category_id: data.category_id,
          bio: data.bio,
          picture: data.picture,
        })
        .where('id', '=', id)
        .execute();
    } catch (error) {
      const hasMessage = 'message' in (error as any);
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `Error while updating artist: ${hasMessage ? (error as any).message : ''}`,
      });
    }
  }

  async deleteArtist(id: number) {
    try {
      return await db.deleteFrom('artist').where('id', '=', id).execute();
    } catch (error) {
      const hasMessage = 'message' in (error as any);
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `Error while deleting artist: ${hasMessage ? (error as any).message : ''}`,
      });
    }
  }
}
