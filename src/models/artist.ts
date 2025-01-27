import {Generated, Insertable, Selectable, Updateable} from 'kysely';
import {IAlbum} from './album';
import {ICategory} from './category';
import {ITrack} from './track';

export interface ArtistTable {
  id: Generated<number>;
  name: string;
  category_id: number;
  bio: string;
  picture: string | undefined;
}

export type IArtist = Selectable<ArtistTable>;
export type NewArtist = Insertable<ArtistTable>;
export type ArtistUpdate = Updateable<ArtistTable>;

export class Artist implements IArtist {
  id: number;
  name: string;
  category_id: number;
  bio: string;
  picture: string | undefined;

  constructor(data: IArtist) {
    this.id = data.id;
    this.name = data.name;
    this.category_id = data.category_id;
    this.bio = data.bio;
    this.picture = data.picture;
  }
}

export interface IArtistExt extends IArtist {
  category: ICategory | null;
  tracks: ITrack[];
  albums: IAlbum[];
}

export class ArtistExt extends Artist implements IArtistExt {
  category: ICategory | null;
  tracks: ITrack[];
  albums: IAlbum[];

  constructor(data: IArtistExt) {
    super(data);
    this.category = data.category;
    this.tracks = data.tracks;
    this.albums = data.albums;
  }
}
