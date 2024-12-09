import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylist} from '../models/playlist';
import {EStatusCode} from '../models/enums/statusCode';

export default class UserController {
  constructor() {}

  getPlaylists = async (req: Request, res: Response) => {
    const playlists: IPlaylist[] = [
      {
        id: 1,
        title: 'Playlist 1',
        user_id: 1,
      },
      {
        id: 2,
        title: 'Playlist 2',
        user_id: 1,
      },
    ];
    const apiResponse = new ApiResponse<IPlaylist[]>({data: playlists});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
