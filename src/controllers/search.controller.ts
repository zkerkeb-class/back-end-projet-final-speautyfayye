import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import SearchRepository from '../repositories/search.repository';
import {Error} from '../models/error';

export default class SearchController {
  constructor(private readonly searchRepository: SearchRepository) {}

  get = async (req: Request, res: Response) => {
    const {input, limit} = req.query;
    const searchInput = typeof input === 'string' ? input : undefined;
    const searchLimit = typeof limit === 'string' ? parseInt(limit, 5) : undefined;
    const search = await this.searchRepository.search(searchInput, searchLimit);
    
    if (!search) {
        throw new Error(EStatusCode.NOT_FOUND, {
            message: 'Track not found',
        });
    };
    const apiResponse = new ApiResponse({data: search});

    res.status(EStatusCode.OK).send(apiResponse);

    }

  autoComplete = async (req: Request, res: Response) => {
    const { q: query } = req.query;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    
    if (!query || typeof query !== 'string') {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'Query parameter is required'
      });
    }

    const suggestions = await this.searchRepository.getAutoCompleteSuggestions(query, limit);
    const apiResponse = new ApiResponse({data: suggestions});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  findSimilar = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    
    if (!trackId) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        message: 'Track ID is required'
      });
    }

    const similarTracks = await this.searchRepository.findSimilarTracks(trackId, limit);
    const apiResponse = new ApiResponse({data: similarTracks});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
