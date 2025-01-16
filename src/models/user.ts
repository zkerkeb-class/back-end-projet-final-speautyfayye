import {Generated, Insertable, Selectable, Updateable} from 'kysely';
import {IPlaylist} from './playlist';

export interface UserTable {
  id: Generated<number>;
  password: string;
  email: string;
}

export type UserWithPassword = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
export type IUser = Omit<UserWithPassword, 'password'>;

export class User implements IUser {
  id: number;
  email: string;

  constructor(data: IUser) {
    this.id = data.id;
    this.email = data.email;
  }
}

export interface IUserExtended extends IUser {
  playlists: IPlaylist[];
}

export class UserExtended extends User implements IUserExtended {
  playlists: IPlaylist[];

  constructor(data: IUserExtended) {
    super(data);
    this.playlists = data.playlists;
  }
}
