import {db} from '../config/db/db';
import {IUser, NewUser} from '../models/user';

export default class UserRepository {
  create = async (user: NewUser): Promise<IUser | undefined> => {
    return await db
      .insertInto('user')
      .values(user)
      .returningAll()
      .executeTakeFirstOrThrow();
  };

  getById = async (id: number): Promise<IUser | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'username', 'email'])
      .where('user.id', '=', id)
      .executeTakeFirst();
  };
  getByEmail = async (email: string): Promise<IUser | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'username', 'email'])
      .where('user.email', '=', email)
      .executeTakeFirst();
  };
  getIdAndPasswordByEmail = async (
    email: string
  ): Promise<{password: string; id: number} | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'password'])
      .where('user.email', '=', email)
      .executeTakeFirst();
  };
  getAllUsers = async (): Promise<IUser[] | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'username', 'email'])
      .execute();
  };
}
