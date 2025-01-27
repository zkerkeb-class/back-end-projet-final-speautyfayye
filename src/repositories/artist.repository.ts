import {jsonArrayFrom, jsonObjectFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {ArtistUpdate, IArtist, IArtistExt, NewArtist} from '../models/artist';
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

  async getById(id: number): Promise<IArtistExt | undefined> {
    return await db
      .selectFrom('artist')
      .selectAll('artist')
      .select(eb => [
        jsonArrayFrom(
          eb
            .selectFrom('track')
            .innerJoin('album', 'album.id', 'track.album_id')
            .innerJoin('artist_album', 'artist_album.album_id', 'album.id')
            .selectAll('track')
            .limit(20)
            .where('artist_album.artist_id', '=', id)
        ).as('tracks'),
        jsonArrayFrom(
          eb
            .selectFrom('album')
            .innerJoin('artist_album', 'artist_album.album_id', 'album.id')
            .selectAll('album')
            .limit(20)
            .where('artist_album.artist_id', '=', id)
        ).as('albums'),
        jsonObjectFrom(
          eb
            .selectFrom('category')
            .selectAll('category')
            .whereRef('category.id', '=', 'artist.category_id')
        ).as('category'),
      ])
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
