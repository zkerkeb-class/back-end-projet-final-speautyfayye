import express, {Router} from 'express';
import SearchController from '../controllers/search.controller';

export default class SearchRouter {
  router: Router;

  constructor(private readonly searchController: SearchController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/').get(this.searchController.get);
    this.router.route('/autocomplete').get(this.searchController.autoComplete);
    this.router.route('/similar/:id').get(this.searchController.findSimilar);
  }
}
