import {Request, Response} from 'express';
import {AlbumExt, AlbumUpdate, IAlbum, NewAlbum} from '../models/album';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import {ApiResponse} from '../models/other/apiResponse';
import AlbumRepository from '../repositories/album.repository';
import TrackRepository from '../repositories/track.repository';

export default class AlbumController {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly trackRepository: TrackRepository
  ) {}

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const album = await this.albumRepository.getById(id);
    const apiResponse = new ApiResponse<IAlbum>({data: album});

    if (!album) {
      throw new Error(EStatusCode.NOT_FOUND);
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
    const {artistId, category, releaseDate, sortBy, sortOrder} = req.query;
    const releaseDateParsed = new Date(releaseDate as string);
    // Préparation des options de filtrage
    const filterOptions = {
      artistId: artistId ? Number(artistId) : undefined,
      category: category ? Number(category) : undefined,
      releaseDate: releaseDate ? releaseDateParsed : undefined,
      sortBy: sortBy ? (sortBy as 'releaseDate' | 'trackCount') : undefined,
      sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
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
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<AlbumExt[]>({data: albums});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  deleteById = async (req: Request, res: Response) => {
    const albumId = Number(req.params.id);
    if (!albumId) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: `Invalid album id ${req.params.id}`,
        logLevel: 'warn',
      });
    }
    await this.albumRepository.deleteById(albumId);
    res.status(EStatusCode.OK).send();
  };

  updateById = async (req: Request, res: Response) => {
    const albumId = Number(req.params.id);
    if (!albumId) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }
    const album = await this.albumRepository.updateById(
      albumId,
      req.body as AlbumUpdate
    );
    const apiResponse = new ApiResponse<IAlbum>({data: album});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  organize = async (req: Request, res: Response) => {
    const albumId = Number(req.params.id);
    if (!albumId) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }
    const organizedTracks: [] = req.body.organizedTracks;
    if (!organizedTracks || organizedTracks.length === 0) {
      throw new Error(EStatusCode.BAD_REQUEST);
    }

    for (let i = 0; i < organizedTracks.length; i++) {
      const track = organizedTracks[i];
      await this.trackRepository.updateById(track[0], {trackNumber: track[1]});
    }

    res.status(EStatusCode.OK).send();
  };
}
