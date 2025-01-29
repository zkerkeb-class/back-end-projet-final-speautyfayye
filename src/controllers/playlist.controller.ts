import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylist, IPlaylistExt, PlaylistUpdate} from '../models/playlist';
import LogRepository from '../repositories/log.repository';
import PlaylistRepository from '../repositories/playlist.repository';

export default class PlaylistController {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly logRepository: LogRepository
  ) {}

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
    // todo changer le userId
    const userId = 1;
    const playlist = await this.playlistRepository.create({
      ...req.body,
      user_id: userId,
    });
    const apiResponse = new ApiResponse<IPlaylist>({data: playlist});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  getAll = async (req: Request, res: Response) => {
    const playlists = await this.playlistRepository.getAll();
    const apiResponse = new ApiResponse<IPlaylist[]>({data: playlists});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  delete = async (req: Request, res: Response) => {
    const playlistId = Number(req.params.id);
    if (!playlistId) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    await this.playlistRepository.deleteById(playlistId);
    res.status(EStatusCode.OK).send();
  };

  update = async (req: Request, res: Response) => {
    const playlistId = Number(req.params.id);
    if (!playlistId) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    const playlist = await this.playlistRepository.updateById(
      playlistId,
      req.body as PlaylistUpdate
    );
    const apiResponse = new ApiResponse<IPlaylist>({data: playlist});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  addTrack = async (req: Request, res: Response) => {
    const playlistId = Number(req.params.id);
    const trackId = Number(req.body.trackId);
    if (!playlistId || !trackId) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }
    const playlist = await this.playlistRepository.getById(playlistId);
    if (!playlist) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    if (playlist.tracks.some(track => track.id === trackId)) {
      throw new Error(EStatusCode.CONFLICT);
    }
    await this.playlistRepository.addTrack({
      playlist_id: playlistId,
      track_id: trackId,
    });
    this.logRepository.logger.info('Track added to playlist', {
      playlistId,
      trackId,
    });
    res.status(EStatusCode.CREATED).send();
  };

  deleteTrack = async (req: Request, res: Response) => {
    const playlist_id = Number(req.params.id);
    const track_id = Number(req.body.trackId);
    console.log('🚀 ~ PlaylistController ~ deleteTrack ~ track_id:', track_id);
    console.log(
      '🚀 ~ PlaylistController ~ deleteTrack ~ playlist_id:',
      playlist_id
    );
    if (!playlist_id || !track_id) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }
    const playlist = await this.playlistRepository.getById(playlist_id);
    if (!playlist) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    if (!playlist.tracks.some(track => track.id === track_id)) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    await this.playlistRepository.deleteTrack({
      playlist_id,
      track_id,
    });
    this.logRepository.logger.info('Track deleted from playlist', {
      playlist_id,
      track_id,
    });
    res.status(EStatusCode.OK).send();
  };
}
