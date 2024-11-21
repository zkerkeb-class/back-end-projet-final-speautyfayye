import { Generated } from "kysely";

export interface IUser {
    id: Generated<number>;
    username: string;
    password: string;
    email: string;
}
  
export interface IArtist {
    id: Generated<number>;
    name: string;
    genre: string;
    bio: string;
}
  
export interface IAlbum {
    id: Generated<number>;
    title: string;
    releaseDate: Date;
    genre: string;
}
  
export interface ITrack {
    id: Generated<number>;
    title: string;
    duration: string;
    releaseDate: Date;
    trackNumber: number;
    album_id: number;
}
  
export interface PIlaylist {
    id: Generated<number>;
    title: string;
    user_id: Generated<number>;
}
  
export interface IArtistAlbum {
    artist_id: Generated<number>;
    album_id: Generated<number>;
}
  
export interface IPlaylistTrack {
    playlist_id: Generated<number>;
    track_id: Generated<number>;
}