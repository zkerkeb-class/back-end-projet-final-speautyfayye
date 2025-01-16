import {db} from '../config/db/db';
import {IUser, NewUser} from '../models/user';

export default class UserRepository {
  create = async (user: NewUser): Promise<IUser | undefined> => {
    return await db
      .insertInto('user')
      .values(user)
      .returning(['id', 'email', 'role'])
      .executeTakeFirstOrThrow();
  };

  getById = async (id: number): Promise<IUser | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'email', 'role'])
      .where('user.id', '=', id)
      .executeTakeFirst();
  };
  getByEmail = async (email: string): Promise<IUser | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'email', 'role'])
      .where('user.email', '=', email)
      .executeTakeFirst();
  };
  getIdAndPasswordByEmail = async (
    email: string
  ): Promise<{password: string; id: number; role: string} | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'password', 'role'])
      .where('user.email', '=', email)
      .executeTakeFirst();
  };
  getAllUsers = async (): Promise<IUser[] | undefined> => {
    return await db
      .selectFrom('user')
      .select(['id', 'email', 'role'])
      .execute();
  };
  update = async (
    id: number,
    user: Partial<IUser>
  ): Promise<IUser | undefined> => {
    return await db
      .updateTable('user')
      .set(user)
      .where('id', '=', id)
      .returning(['id', 'email', 'role'])
      .executeTakeFirst();
  };
}
