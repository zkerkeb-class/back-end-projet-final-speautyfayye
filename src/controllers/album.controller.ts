import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import {AlbumExt, IAlbum, NewAlbum} from '../models/album';
import AlbumRepository from '../repositories/album.repository';
import {Error} from '../models/error';

export default class AlbumController {
  constructor(private readonly albumRepository: AlbumRepository) {}

  get = async (req: Request, res: Response) => {
    const albumId = Number(req.params.id);
    const album = await this.albumRepository.get(albumId);

    if (!album) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<AlbumExt>({data: album});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    const album = await this.albumRepository.create(req.body as NewAlbum);
    const apiResponse = new ApiResponse<IAlbum>({data: album});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };
}
