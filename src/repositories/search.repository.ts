import {db} from '../config/db/db';
import {ITrack} from '../models/track';
import { IArtist } from '../models/artist';
import { IAlbum } from '../models/album';
import { IPlaylist } from '../models/playlist';


interface SearchOutput {
    artists: IArtist[];
    albums: IAlbum[];
    playlists: IPlaylist[];
    tracks: ITrack[];
}

export default class SearchRepository {
    async search(
        input: string,
        limit: number = 5
    ): Promise<SearchOutput> {
    
        const artists = await db
            .selectFrom('artist')
            .selectAll()
            .where('artist.name', 'ilike', `%${input}%`)
            .limit(limit)
            .execute() as IArtist[]

        const albums = await db
            .selectFrom('album')
            .selectAll()
            .where('album.title', 'ilike', `%${input}%`)
            .limit(limit)
            .execute() as IAlbum[]

        const playlists = await db
            .selectFrom('playlist')
            .selectAll()
            .where('playlist.title', 'ilike', `%${input}%`)
            .limit(limit)
            .execute() as IPlaylist[]

        const tracks = await db
            .selectFrom('track')
            .selectAll()
            .where('track.title', 'ilike', `%${input}%`)
            .limit(limit)
            .execute() as ITrack[]


        return {
            "artists": artists,
            "albums": albums,
            "playlists": playlists,
            "tracks": tracks
        };
  };
}