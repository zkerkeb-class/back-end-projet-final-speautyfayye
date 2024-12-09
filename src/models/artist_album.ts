import {Insertable, Selectable, Updateable} from 'kysely';

export interface ArtistAlbumTable {
  artist_id: number;
  album_id: number;
}

export type IArtistAlbum = Selectable<ArtistAlbumTable>;
export type NewAlbum = Insertable<ArtistAlbumTable>;
export type AlbumUpdate = Updateable<ArtistAlbumTable>;
