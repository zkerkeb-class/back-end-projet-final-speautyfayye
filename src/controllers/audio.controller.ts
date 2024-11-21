import { Request, Response } from 'express';
import { EStatusCode } from '../models/enums/statusCode';
import AudioService from '../services/audio.service';
import { Error } from '../models/error';

export default class AudioController {
  constructor(private readonly audioService: AudioService) {}

  upload = async (req: Request, res: Response) => {
    if (!req.files?.length) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'No file found',
      });
    }

    await Promise.all(
      (req.files as []).map((file: Express.Multer.File) =>
        this.audioService.upload(file),
      ),
    );

    res.status(EStatusCode.CREATED).send();
  };

  get = async (req: Request, res: Response) => {
    const { name } = req.params;
    const { range } = req.headers;

    if (!name) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }

    if (range) {
      const { readable, chunkSize, end, start, fileSize } =
        this.audioService.readPartial(name, range);
      res.writeHead(EStatusCode.PARTIAL_CONTENT, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mp3',
      });

      readable.pipe(res);
    } else {
      this.audioService.read(name).pipe(res);
    }
  };
}
