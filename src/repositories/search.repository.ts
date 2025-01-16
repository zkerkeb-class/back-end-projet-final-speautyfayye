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
    async search(input: string | undefined , limit: number = 5): Promise<SearchOutput> {
        const [artists, albums, playlists, tracks] = await Promise.all([
            db
                .selectFrom('artist')
                .selectAll()
                .where('artist.name', 'ilike', `%${input}%`)
                .limit(limit)
                .execute(),
            db
                .selectFrom('album')
                .selectAll()
                .where('album.title', 'ilike', `%${input}%`)
                .limit(limit)
                .execute(),
            db
                .selectFrom('playlist')
                .selectAll()
                .where('playlist.title', 'ilike', `%${input}%`)
                .limit(limit)
                .execute(),
            db
                .selectFrom('track')
                .selectAll()
                .where('track.title', 'ilike', `%${input}%`)
                .limit(limit)
                .execute()
        ]);               

        return {
            "artists": artists,
            "albums": albums,
            "playlists": playlists,
            "tracks": tracks
        };
  };
}