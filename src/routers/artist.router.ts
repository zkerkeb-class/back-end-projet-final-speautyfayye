import express, {Router} from 'express';
import ArtistController from '../controllers/artist.controller';
import CacheMiddleware from '../middleware/cache.middleware';

export default class ArtistRouter {
  router: Router;

  constructor(
    private readonly artistController: ArtistController,
    private readonly cacheMiddleware: CacheMiddleware
  ) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router
      .route('/')
      .get(this.cacheMiddleware.get, this.artistController.getAll);

    this.router.route('/:id').get(this.artistController.getById);

    this.router.route('/:name').get(this.artistController.getByName);

    this.router.route('/').post(this.artistController.create);

    this.router.route('/:id').put(this.artistController.update);

    this.router.route('/:id').delete(this.artistController.delete);
  }
}
