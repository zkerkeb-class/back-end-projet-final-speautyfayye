import {db} from '../config/db/db';
import {ITrack} from '../models/track';
import { IArtist } from '../models/artist';
import { IAlbum } from '../models/album';
import { IPlaylist } from '../models/playlist';
import { sql } from 'kysely';


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

interface SimilarTrackResult {
  id: number;
  title: string;
  artist: string | null;
  genre: string;
  similarity_score: number;
}

interface SimilarTracksResponse {
  count: number;
  tracks: SimilarTrackResult[];
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

  async findSimilarTracks(trackId: number, limit: number = 20): Promise<SimilarTracksResponse> {

    const referenceTrack = await db
      .selectFrom('track')
      .innerJoin('category', 'category.id', 'track.category_id')
      .innerJoin('album', 'album.id', 'track.album_id')
      .select([
        'track.id',
        'track.category_id',
        'album.releaseDate',
        'track.number_of_plays'
      ])
      .where('track.id', '=', trackId)
      .executeTakeFirst();

    if (!referenceTrack) {
      return {
        count: 0,
        tracks: []
      };
    }

    const similarTracks = await db
      .selectFrom('track')
      .innerJoin('category', 'category.id', 'track.category_id')
      .leftJoin('album', 'album.id', 'track.album_id')
      .leftJoin('artist_album', 'artist_album.album_id', 'album.id')
      .leftJoin('artist', 'artist.id', 'artist_album.artist_id')
      .select([
        'track.id',
        'track.title',
        'artist.name as artist',
        'category.name as genre',
        eb => eb.fn.coalesce(
          sql<number>`
            CASE 
              WHEN track.category_id = ${referenceTrack.category_id} THEN 1
              ELSE 0
            END +
            CASE 
              WHEN EXTRACT(YEAR FROM album."releaseDate") = EXTRACT(YEAR FROM ${referenceTrack.releaseDate}::timestamp) THEN 0.2
              ELSE 0
            END
          `,
          eb.val(0)
        ).as('similarity_score')
      ])
      .where('track.id', '!=', trackId)
      .orderBy('similarity_score', 'desc')
      .limit(limit)
      .execute();

    const result = {
      count: similarTracks.length,
      tracks: similarTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        similarity_score: t.similarity_score,
      }))
    };

    console.log("result", result);

    return result;
  }
}
