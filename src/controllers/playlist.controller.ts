import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylistExt} from '../models/playlist';
import {EStatusCode} from '../models/enums/statusCode';

export default class PlaylistController {
  constructor() {}

  get = async (req: Request, res: Response) => {
    const playlistId = Number(req.params.id);

    // Todo: Implement
    const playlist: IPlaylistExt = {
      id: playlistId,
      title: 'Playlist 1',
      user_id: 1,
      tracks: [
        {
          id: 1,
          album_id: 1,
          duration: '400',
          releaseDate: new Date(),
          title: 'Track 1',
          trackNumber: 1,
          category_id: 1,
          picture: undefined,
        },
        {
          id: 2,
          album_id: 1,
          duration: '400',
          releaseDate: new Date(),
          title: 'Track 2',
          trackNumber: 2,
          category_id: 2,
          picture: undefined,
        },
        {
          id: 3,
          album_id: 2,
          duration: '400',
          releaseDate: new Date(),
          title: 'Track 3',
          trackNumber: 3,
          category_id: 1,
          picture: undefined,
        },
      ],
    };

    const apiResponse = new ApiResponse<IPlaylistExt>({data: playlist});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
