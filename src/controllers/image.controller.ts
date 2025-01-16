import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import ImageService from '../services/image.service';
import {Error} from '../models/error';
import {EImageExtension} from '../models/enums/extension';
import {cache} from '../middleware/cache.middleware';
import {ApiResponse} from '../models/other/apiResponse';
import TrackRepository from '../repositories/track.repository';
import AlbumRepository from '../repositories/album.repository';
import ArtistRepository from '../repositories/artist.repository';

enum IEntityTypeId {
  track = 1,
  album = 2,
  artist = 3,
}

export default class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly trackRepository: TrackRepository,
    private readonly albumRepository: AlbumRepository,
    private readonly artistRepository: ArtistRepository
  ) {}

  upload = async (req: Request, res: Response) => {
    if (!req.files?.length) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'No file found',
      });
    }

    const {entityTypeId, entityId} = req.params;
    if (!entityTypeId || !entityId) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'Entity type and id are required',
      });
    }

    if (!Object.values(IEntityTypeId).includes(+entityTypeId)) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'Invalid entity type',
      });
    }

    const ids = await Promise.all(
      (req.files as []).map((file: Express.Multer.File) =>
        this.imageService.upload(file)
      )
    );

    switch (+entityTypeId) {
      case IEntityTypeId.track:
        await this.trackRepository.updateById(+entityId, {picture: ids[0]});
        break;
      case IEntityTypeId.album:
        await this.albumRepository.updateById(+entityId, {picture: ids[0]});
        break;
      case IEntityTypeId.artist:
        await this.artistRepository.updateById(+entityId, {picture: ids[0]});
        break;
      default:
    }

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
