import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylist, IPlaylistExt, NewPlaylist} from '../models/playlist';
import {EStatusCode} from '../models/enums/statusCode';
import PlaylistRepository from '../repositories/playlist.repository';
import {Error} from '../models/error';

export default class PlaylistController {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  get = async (req: Request, res: Response) => {
    const playlistId = Number(req.params.id);
    const playlist = await this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<IPlaylistExt>({data: playlist});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    // todo validations
    console.log('🚀 ~ PlaylistController ~ create= ~ req.body:', req.body);
    const playlist = await this.playlistRepository.create(
      req.body as NewPlaylist
    );
    const apiResponse = new ApiResponse<IPlaylist>({data: playlist});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  getAll = async (req: Request, res: Response) => {
    const playlists = await this.playlistRepository.getAll();
    const apiResponse = new ApiResponse<IPlaylist[]>({data: playlists});
    res.status(EStatusCode.OK).send(apiResponse);
    };
}
