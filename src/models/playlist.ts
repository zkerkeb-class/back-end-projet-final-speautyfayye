import {Generated, Insertable, Selectable, Updateable} from 'kysely';
import {ITrack, ITrackExt} from './track';

export interface PlaylistTable {
  id: Generated<number>;
  title: string;
  user_id: Generated<number>;
}

export type IPlaylist = Selectable<PlaylistTable>;
export type NewPlaylist = Insertable<PlaylistTable>;
export type PlaylistUpdate = Updateable<PlaylistTable>;

export class Playlist implements IPlaylist {
  id: number;
  title: string;
  user_id: number;

  constructor(data: IPlaylist) {
    this.id = data.id;
    this.title = data.title;
    this.user_id = data.user_id;
  }
}

export interface IPlaylistExt extends IPlaylist {
  tracks: ITrack[];
}

export class PlaylistExt extends Playlist implements IPlaylistExt {
  tracks: ITrack[];

  constructor(data: IPlaylistExt) {
    super(data);
    this.tracks = data.tracks ?? [];
  }
}
