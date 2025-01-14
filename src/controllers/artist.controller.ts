import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import ArtistRepository from '../repositories/artist.repository';
import { IArtist } from '../models/artist';

export default class ArtistController {
    constructor(private readonly artistRepository: ArtistRepository) {}

    getAll = async (_req: Request, res: Response) => {
        const artists = await this.artistRepository.getAllArtists();
        const apiResponse = new ApiResponse<IArtist[]>({data: artists});
        
        if (!artists) {
            res.status(EStatusCode.NOT_FOUND).send(apiResponse);
        }

        res.status(EStatusCode.OK).send(apiResponse);
    }

    getById = async (req: Request, res: Response) => {
        const artistId = parseInt(req.params.id);
        const artist = await this.artistRepository.getArtistById(artistId);
        const apiResponse = new ApiResponse<IArtist>({data: artist});

        if (!artist) {
            res.status(EStatusCode.NOT_FOUND).send(apiResponse);
        }

        res.status(EStatusCode.OK).send(apiResponse);
    }

    getByName = async (req: Request, res: Response) => {
        const artistName = req.params.name;
        const artist = await this.artistRepository.getAristByName(artistName);
        const apiResponse = new ApiResponse<IArtist>({data: artist});

        if (!artist) {
            res.status(EStatusCode.NOT_FOUND).send(apiResponse);
        }

        res.status(EStatusCode.OK).send(apiResponse);
    }

    create = async (req: Request, res: Response) => {
        const artist = req.body;
        const createdArtist = await this.artistRepository.createArtist(artist);
        const apiResponse = new ApiResponse<IArtist>({data: createdArtist});

        res.status(EStatusCode.CREATED).send(apiResponse);
    }

    update = async (req: Request, res: Response) => {
        const artistId = parseInt(req.params.id);
        const artist = req.body;
        const updatedArtist = await this.artistRepository.updateArtist(artistId, artist);
        const apiResponse = new ApiResponse<IArtist>({data: updatedArtist});

        res.status(EStatusCode.OK).send(apiResponse);
    }

    delete = async (req: Request, res: Response) => {
        const artistId = parseInt(req.params.id);
        await this.artistRepository.deleteArtist(artistId);

        res.status(EStatusCode.OK).send();
    }
}