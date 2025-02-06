import {Insertable, Selectable, Updateable} from 'kysely';

export interface PlaylistTrackTable {
  playlist_id: number;
  track_id: number;
}

export type IPlaylistTrack = Selectable<PlaylistTrackTable>;
export type NewPlaylistTrack = Insertable<PlaylistTrackTable>;
export type PlaylistTrackUpdate = Updateable<PlaylistTrackTable>;
