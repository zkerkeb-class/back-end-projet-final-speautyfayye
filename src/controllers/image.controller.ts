import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import ImageService from '../services/image.service';
import {Error} from '../models/error';
import {EImageExtension} from '../models/enums/extension';
import {cache} from '../middleware/cache.middleware';
import {ApiResponse} from '../models/other/apiResponse';

export default class ImageController {
  constructor(private readonly imageService: ImageService) {}

  upload = async (req: Request, res: Response) => {
    if (!req.files?.length) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'No file found',
      });
    }

    const ids = await Promise.all(
      (req.files as []).map((file: Express.Multer.File) =>
        this.imageService.upload(file)
      )
    );

    const apiResponse = new ApiResponse<string[]>({data: ids});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  get = async (req: Request, res: Response) => {
    const {name, ext, size} = req.params;
    const readStream = this.imageService.read(
      name,
      size,
      ext as EImageExtension
    );
    cache.set(req.originalUrl, readStream);
    readStream.pipe(res);
  };
}
