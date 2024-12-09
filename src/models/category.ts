import {Generated, Insertable, Selectable, Updateable} from 'kysely';

export interface CategoryTable {
  category_id: Generated<number>;
  name: string;
}

export type ICategory = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;
