import {jsonArrayFrom} from 'kysely/helpers/postgres';
import {db} from '../config/db/db';
import {ICategory, ICategoryExt, NewCategory} from '../models/category';

export default class CategoryRepository {
  create = async (category: NewCategory): Promise<ICategory> => {
    return await db
      .insertInto('category')
      .values(category)
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  getById = async (id: number): Promise<ICategoryExt | undefined> => {
    return await db
      .selectFrom('category')
      .selectAll('category')
      .select(eb => [
        jsonArrayFrom(
          eb
            .selectFrom('album')
            .selectAll('album')
            .limit(5)
            .where('album.category_id', '=', id)
        ).as('albums'),
        jsonArrayFrom(
          eb
            .selectFrom('track')
            .selectAll('track')
            .limit(5)
            .where('track.category_id', '=', id)
        ).as('tracks'),
      ])
      .where('category.id', '=', id)
      .executeTakeFirst();
  };
}
