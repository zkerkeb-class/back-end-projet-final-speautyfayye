import {db} from '../config/db/db';
import { EStatusCode } from '../models/enums/statusCode';
import { Error } from '../models/error';
import { IArtist, NewArtist, ArtistUpdate } from '../models/artist';

export default class ArtistRepository {

    async getAllArtists(option?: {
        category_id?: number;
    }): Promise<IArtist[]> {
            let query = db
                .selectFrom('artist')
                .selectAll()
            
            if (option?.category_id) {
                query = query
                    .where('category_id', '=', option.category_id);
            }

            query = query.orderBy('artist.name', 'asc');
            return await query.execute();
    }

    async getArtistById(id: number) {
        try {
            const artist = await db
                .selectFrom('artist')
                .where('id', '=', id)
                .selectAll()
                .executeTakeFirst();
            
            if (!artist) {
                return new Error(EStatusCode.NOT_FOUND);
            }
        }
        catch (error) {
            throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getAristByName(name: string) {
        try {
            const artist = await db
                .selectFrom('artist')
                .where('name', '=', name)
                .selectAll()
                .executeTakeFirst();
            
            if (!artist) {
                return new Error(EStatusCode.NOT_FOUND);
            }

        }
        catch (error) {
            throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async createArtist(data: NewArtist) {
        try {
            const artist = await db
                .insertInto('artist')
                .values({
                    name: data.name,
                    category_id: data.category_id,
                    bio: data.bio,
                    picture: data.picture
                })
                .execute();
            
            if (!artist) {
                return new Error(EStatusCode.BAD_REQUEST);
            }

            return artist;
        }
        catch (error) {
            throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async updateArtist(id: number, data: ArtistUpdate) {
        try {
            const artist = await db
                .updateTable('artist')
                .set({
                    name: data.name,
                    category_id: data.category_id,
                    bio: data.bio,
                    picture: data.picture
                })
                .where('id', '=', id)
                .execute();
            
            if (!artist) {
                return new Error(EStatusCode.BAD_REQUEST);
            }

            return artist;
        }
        catch (error) {
            throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteArtist(id: number) {
        try {
            const artist = await db
                .deleteFrom('artist')
                .where('id', '=', id)
                .execute();
            
            if (!artist) {
                return new Error(EStatusCode.BAD_REQUEST);
            }

            return artist;
        }
        catch (error) {
            throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}