import {Generated, Insertable, Selectable, Updateable} from 'kysely';
import {ICategory} from './category';
import {IAlbum} from './album';

export interface TrackTable {
  id: Generated<number>;
  title: string;
  duration: number | undefined;
  releaseDate: Date;
  trackNumber: number;
  album_id: number;
  category_id: number;
  picture: string | undefined;
  audio: string;
  number_of_plays: number;
}

export type ITrack = Selectable<TrackTable>;
export type NewTrack = Insertable<TrackTable>;
export type TrackUpdate = Updateable<TrackTable>;

export class Track implements ITrack {
  id: number;
  title: string;
  duration: number | undefined;
  releaseDate: Date;
  trackNumber: number;
  album_id: number;
  category_id: number;
  picture: string | undefined;
  audio: string;
  number_of_plays: number;

  constructor(data: ITrack) {
    this.id = data.id;
    this.title = data.title;
    this.duration = data.duration;
    this.releaseDate = data.releaseDate;
    this.trackNumber = data.trackNumber;
    this.album_id = data.album_id;
    this.category_id = data.category_id;
    this.picture = data.picture;
    this.audio = data.audio;
    this.number_of_plays = data.number_of_plays;
  }
}

export interface ITrackExt extends ITrack {
  category: ICategory | null;
  album: IAlbum | null;
}

export class TrackExt extends Track implements ITrackExt {
  category: ICategory | null;
  album: IAlbum | null;

  constructor(data: ITrackExt) {
    super(data);
    this.category = data.category;
    this.album = data.album;
  }
}
