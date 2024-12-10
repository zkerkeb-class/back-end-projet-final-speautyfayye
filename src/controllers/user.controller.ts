import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylist} from '../models/playlist';
import {EStatusCode} from '../models/enums/statusCode';
import PlaylistRepository from '../repositories/playlist.repository';

export default class UserController {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  getPlaylists = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const playlists = await this.playlistRepository.getByUserId(Number(userId));

    const apiResponse = new ApiResponse<IPlaylist[]>({data: playlists});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
