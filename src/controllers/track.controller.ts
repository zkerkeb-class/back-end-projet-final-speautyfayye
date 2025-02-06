import {Request, Response} from 'express';
import z from 'zod';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import {ApiResponse} from '../models/other/apiResponse';
import {ITrack, NewTrack, TrackExt, TrackUpdate} from '../models/track';
import TrackRepository from '../repositories/track.repository';

export default class TrackController {
  private titleSchema = z.string().trim().min(1).max(255);

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
    const newTrack: NewTrack = req.body;
    const validationResult = this.titleSchema.safeParse(newTrack?.title);
    if (!validationResult.success) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        logLevel: 'warn',
        message: `Invalid title ${validationResult.error.message}`,
      });
    }
    const track = await this.trackRepository.create(req.body as NewTrack);
    const apiResponse = new ApiResponse<ITrack>({data: track});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  getAllWithFilters = async (req: Request, res: Response) => {
    const tracks = await this.trackRepository.getAllWithFilters(req.query);
    const apiResponse = new ApiResponse<ITrack[]>({data: tracks});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  updateById = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);

    if (!trackId) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    const track = await this.trackRepository.updateById(
      trackId,
      req.body as TrackUpdate
    );
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
  };

  getMostPlayed = async (req: Request, res: Response) => {
    console.log('aAAAAAAAAAAAA');

    const tracks = await this.trackRepository.getMostPlayed();
    const apiResponse = new ApiResponse<ITrack[]>({data: tracks});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
