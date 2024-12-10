import express, {Router} from 'express';
import CategoryController from '../controllers/category.controller';

export default class CategoryRouter {
  router: Router;

  constructor(private readonly categoryController: CategoryController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/:id').get(this.categoryController.get);

    this.router.route('/').post(this.categoryController.create);
  }
}
