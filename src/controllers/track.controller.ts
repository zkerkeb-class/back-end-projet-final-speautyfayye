import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import {ITrack, NewTrack, TrackExt, TrackUpdate} from '../models/track';
import TrackRepository from '../repositories/track.repository';
import {Error} from '../models/error';

export default class TrackController {
  constructor(private readonly trackRepository: TrackRepository) {}

  get = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);
    const track = await this.trackRepository.getById(trackId);

    if (!track) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<TrackExt>({data: track});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    const track = await this.trackRepository.create(req.body as NewTrack);
    const apiResponse = new ApiResponse<ITrack>({data: track});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  getAllWithFilters = async (req: Request, res: Response) => {
    const tracks = await this.trackRepository.getAllWithFilters(req.query);
    const apiResponse = new ApiResponse<ITrack[]>({data: tracks});
    res.status(EStatusCode.OK).send(apiResponse);
  }

  updateById = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);

    if (!trackId) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    const track = await this.trackRepository.updateById(trackId, req.body as TrackUpdate);
    const apiResponse = new ApiResponse<TrackUpdate>({data: track});
    res.status(EStatusCode.OK).send(apiResponse);
  };
  
  deleteById = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);
    if (!trackId) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    await this.trackRepository.deleteById(trackId);
    res.status(EStatusCode.OK).send();
  }
}
