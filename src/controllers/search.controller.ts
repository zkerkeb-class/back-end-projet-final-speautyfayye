import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import SearchRepository from '../repositories/search.repository';
import {Error} from '../models/error';

export default class SearchController {
  constructor(private readonly searchRepository: SearchRepository) {}

  get = async (req: Request, res: Response) => {
    const {input} = req.query;
    if (typeof input !== 'string') {
        throw new Error(EStatusCode.BAD_REQUEST, {
            message: 'Invalid input type',
        });
    }
    const search = await this.searchRepository.search(input);
    const apiResponse = new ApiResponse({data: search});

    if (!search) {
        throw new Error(EStatusCode.NOT_FOUND, {
            message: 'Track not found',
        });
    };

    res.status(EStatusCode.OK).send(apiResponse);

    }
}
