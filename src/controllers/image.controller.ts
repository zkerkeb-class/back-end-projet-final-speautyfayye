import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import ImageService from '../services/image.service';
import {Error} from '../models/error';
import {EImageExtension} from '../models/enums/extension';
import {cache} from '../middleware/cache.middleware';
import path from 'path';

export default class ImageController {
  allowedExtensions = ['.webp', '.jpeg', '.png', '.jpg'];

  constructor(private readonly imageService: ImageService) {}

  upload = async (req: Request, res: Response) => {
    if (!req.files?.length) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'No file found',
      });
    }

    const files = req.files as [];

    const notAllowedExtensions = files
      .map((file: Express.Multer.File) => path.extname(file.originalname))
      .filter((ext: string) => !this.allowedExtensions.includes(ext));

    if (notAllowedExtensions.length) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: notAllowedExtensions,
      });
    }

    await Promise.all(
      files.map((file: Express.Multer.File) => this.imageService.upload(file))
    );

    res.status(EStatusCode.CREATED).send();
  };

  get = async (req: Request, res: Response) => {
    const {name, ext, size} = req.params;
    const readStream = this.imageService.read(
      name,
      size,
      ext as EImageExtension
    );
    if (!readStream) {
      throw new Error(EStatusCode.NOT_FOUND);
    }
    cache.set(req.originalUrl, readStream);
    readStream.pipe(res);
  };
}
