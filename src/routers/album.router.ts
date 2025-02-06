import express, {Router} from 'express';
import AlbumController from '../controllers/album.controller';
import CacheMiddleware from '../middleware/cache.middleware';

export default class AlbumRouter {
  router: Router;

  constructor(
    private readonly albumController: AlbumController,
    private readonly cacheMiddleware: CacheMiddleware
  ) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/:id').delete(this.albumController.deleteById);
    this.router.route('/:id').put(this.albumController.updateById);
    this.router.route('/:id').get(this.albumController.getById);
    this.router.route('/').post(this.albumController.create);
    this.router
      .route('/')
      .get(this.cacheMiddleware.get, this.albumController.getAllWithFilters);

    this.router.route('/:id/organize').put(this.albumController.organize);
  }
}
