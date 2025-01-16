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
}
