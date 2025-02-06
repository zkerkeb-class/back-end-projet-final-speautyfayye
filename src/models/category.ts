import {Generated, Insertable, Selectable, Updateable} from 'kysely';
import {IAlbum} from './album';
import {IPlaylist} from './playlist';
import {ITrack} from './track';

export interface CategoryTable {
  id: Generated<number>;
  name: string;
}

export type ICategory = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;

export class Category implements ICategory {
  id: number;
  name: string;

  constructor(data: ICategory) {
    this.id = data.id;
    this.name = data.name;
  }
}

export interface ICategoryExt extends ICategory {
  albums?: IAlbum[];
  playlists?: IPlaylist[];
  tracks?: ITrack[];
}

export class CategoryExt extends Category implements ICategoryExt {
  albums?: IAlbum[];
  tracks?: ITrack[];

  constructor(data: ICategoryExt) {
    super(data);
    this.albums = data.albums;
    this.tracks = data.tracks;
  }
}
