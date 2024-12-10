import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import CategoryRepository from '../repositories/category.repository';
import {ICategory, ICategoryExt, NewCategory} from '../models/category';
import {Error} from '../models/error';

export default class CategoryController {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  get = async (req: Request, res: Response) => {
    const categoryId = Number(req.params.id);
    const category = await this.categoryRepository.getById(categoryId);

    if (!category) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    const apiResponse = new ApiResponse<ICategoryExt>({data: category});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    const category = await this.categoryRepository.create(
      req.body as NewCategory
    );
    const apiResponse = new ApiResponse<ICategory>({data: category});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };
}
