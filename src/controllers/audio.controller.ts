import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import AudioService from '../services/audio.service';
import {Error} from '../models/error';
import {ApiResponse} from '../models/other/apiResponse';
import TrackRepository from '../repositories/track.repository';

export default class AudioController {
  constructor(
    private readonly audioService: AudioService,
    private readonly trackRepository: TrackRepository
  ) {}

  upload = async (req: Request, res: Response) => {
    if (!req.files?.length) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'No file found',
      });
    }

    const ids = await Promise.all(
      (req.files as []).map((file: Express.Multer.File) =>
        this.audioService.upload(file)
      )
    );

    const apiResponse = new ApiResponse<string[]>({data: ids});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  get = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);
    if (!trackId || isNaN(trackId)) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }

    const track = await this.trackRepository.getById(trackId);
    console.log('🚀 ~ AudioController ~ get= ~ track:', track);
    if (!track) {
      throw new Error(EStatusCode.NOT_FOUND, {
        message: `Track with id ${trackId} not found`,
      });
    }

    try {
      const {range} = req.headers;
      if (range) {
        const {readable, chunkSize, end, start, fileSize} =
          this.audioService.readPartial(`${track.audio}.mp3`, range);
        res.writeHead(EStatusCode.PARTIAL_CONTENT, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'audio/mp3',
          duration: track.duration,
          'Access-Control-Expose-Headers':
            'Content-Range, Content-Length, duration',
        });

        readable.pipe(res);
      } else {
        const {readable} = this.audioService.read(track.audio);
        res.writeHead(EStatusCode.PARTIAL_CONTENT, {
          'Content-Type': 'audio/mp3',
          duration: track.duration,
          'Access-Control-Expose-Headers': 'duration',
        });
        readable.pipe(res);
      }
    } catch (error) {
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR, {
        message: `error while reading file ${trackId}`,
      });
    }
  };
}
