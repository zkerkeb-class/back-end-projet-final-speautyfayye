import {Generated, Insertable, Selectable, Updateable} from 'kysely';

export interface AlbumTable {
  id: Generated<number>;
  title: string;
  releaseDate: Date;
  category_id: number;
  picture: string | undefined;
}

export type IAlbum = Selectable<AlbumTable>;
export type NewAlbum = Insertable<AlbumTable>;
export type AlbumUpdate = Updateable<AlbumTable>;
