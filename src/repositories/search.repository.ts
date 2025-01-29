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

interface AutoCompleteResult {
  id: number;
  title: string;
  type: 'track' | 'artist';
  plays: number;
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

  async getAutoCompleteSuggestions(query: string, limit: number = 5): Promise<AutoCompleteResult[]> {
    const [popularTracks, popularArtists] = await Promise.all([
      db.selectFrom('track')
        .select([
          'track.id',
          'track.title',
          'track.number_of_plays as plays',
          eb => eb.val('track').as('type')
        ])
        .where('track.title', 'ilike', `${query}%`)
        .orderBy('track.number_of_plays', 'desc')
        .limit(limit)
        .execute(),
      db.selectFrom('artist')
        .leftJoin('artist_album', 'artist_album.artist_id', 'artist.id')
        .leftJoin('track', 'track.album_id', 'artist_album.album_id')
        .select([
          'artist.id',
          'artist.name as title',
          eb => eb.fn.sum('track.number_of_plays').as('plays'),
          eb => eb.val('artist').as('type')
        ])
        .where('artist.name', 'ilike', `${query}%`)
        .groupBy('artist.id')
        .orderBy('plays', 'desc')
        .limit(limit)
        .execute()
    ]);

    return [...popularTracks, ...popularArtists] as AutoCompleteResult[];
  }
}