import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import {IAlbum, NewAlbum, AlbumExt} from '../models/album';
import AlbumRepository from '../repositories/album.repository';
import { read } from 'fs';

export default class AlbumController {
  constructor(private readonly albumRepository: AlbumRepository) {}

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const album = await this.albumRepository.getById(id);
    const apiResponse = new ApiResponse<IAlbum>({data: album});

    if (!album) {
      res.status(EStatusCode.NOT_FOUND).send(apiResponse);
    }
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    // todo validations
    const album = await this.albumRepository.create(req.body as NewAlbum);
    const apiResponse = new ApiResponse<IAlbum>({data: album});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  getAllWithFilters = async (req: Request, res: Response) => {
      const { artistId, category, releaseDate } = req.query;
      const releaseDateParsed = new Date(releaseDate as string);
      // Préparation des options de filtrage
      const filterOptions = {
          artistId: artistId ? Number(artistId) : undefined,
          category: category ? Number(category) : undefined,
          releaseDate: releaseDate ? releaseDateParsed : undefined,
      };

      // Validation des filtres numériques
      if (filterOptions.artistId && isNaN(filterOptions.artistId)) {
          res.status(EStatusCode.BAD_REQUEST);
      }

      if (filterOptions.releaseDate) {
        res.status(EStatusCode.BAD_REQUEST);
      }

      const albums = await this.albumRepository.getAll(filterOptions);

      if (!albums || albums.length === 0) {
          res.status(EStatusCode.NOT_FOUND);
      }

      const apiResponse = new ApiResponse<AlbumExt[]>({ data: albums });
      res.status(EStatusCode.OK).send(apiResponse);
};
}
