import {Generated, Insertable, Selectable, Updateable} from 'kysely';
import {ITrack} from './track';
import {IArtist} from './artist';

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

export class Album implements IAlbum {
  id: number;
  title: string;
  releaseDate: Date;
  category_id: number;
  picture: string | undefined;

  constructor(data: IAlbum) {
    this.id = data.id;
    this.title = data.title;
    this.releaseDate = data.releaseDate;
    this.category_id = data.category_id;
    this.picture = data.picture;
  }
}

export interface IAlbumExt extends IAlbum {
  tracks: ITrack[] | null;
  artist: IArtist | null;
}

export class AlbumExt extends Album implements IAlbumExt {
  tracks: ITrack[] | null;
  artist: IArtist | null;

  constructor(data: IAlbumExt) {
    super(data);
    this.tracks = data.tracks;
    this.artist = data.artist;
  }
}
