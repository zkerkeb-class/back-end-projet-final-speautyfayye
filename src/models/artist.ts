import {Generated, Insertable, Selectable, Updateable} from 'kysely';

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
