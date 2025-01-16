import {Request, Response} from 'express';
import {IArtist} from '../models/artist';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import {ApiResponse} from '../models/other/apiResponse';
import ArtistRepository from '../repositories/artist.repository';

export default class ArtistController {
  constructor(private readonly artistRepository: ArtistRepository) {}

  getAll = async (_req: Request, res: Response) => {
    const artists = await this.artistRepository.getAllArtists();

    if (!artists) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<IArtist[]>({data: artists});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  getById = async (req: Request, res: Response) => {
    const artistId = parseInt(req.params.id);
    const artist = await this.artistRepository.getArtistById(artistId);

    if (!artist) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<IArtist>({data: artist});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  getByName = async (req: Request, res: Response) => {
    const artistName = req.params.name;
    const artist = await this.artistRepository.getAristByName(artistName);

    if (!artist) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<IArtist>({data: artist});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    const artist = req.body;
    const createdArtist = await this.artistRepository.createArtist(artist);

    const apiResponse = new ApiResponse<IArtist>({data: createdArtist});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  update = async (req: Request, res: Response) => {
    const artistId = parseInt(req.params.id);
    const artist = req.body;
    const updatedArtist = await this.artistRepository.updateById(
      artistId,
      artist
    );
    const apiResponse = new ApiResponse<IArtist>({data: updatedArtist});

    res.status(EStatusCode.OK).send(apiResponse);
  };

  delete = async (req: Request, res: Response) => {
    const artistId = parseInt(req.params.id);
    await this.artistRepository.deleteArtist(artistId);

    res.status(EStatusCode.OK).send();
  };
}
