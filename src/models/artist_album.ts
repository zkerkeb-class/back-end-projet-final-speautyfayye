import {Insertable, Selectable, Updateable} from 'kysely';

export interface ArtistAlbumTable {
  artist_id: number;
  album_id: number;
}

export type IArtistAlbum = Selectable<ArtistAlbumTable>;
export type NewAlbum = Insertable<ArtistAlbumTable>;
export type AlbumUpdate = Updateable<ArtistAlbumTable>;

export class ArtistAlbum implements IArtistAlbum {
  artist_id: number;
  album_id: number;

  constructor(data: IArtistAlbum) {
    this.artist_id = data.artist_id;
    this.album_id = data.album_id;
  }
}