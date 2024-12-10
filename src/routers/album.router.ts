import express, {Router} from 'express';
import AlbumController from '../controllers/album.controller';

export default class AlbumRouter {
  router: Router;

  constructor(private readonly albumController: AlbumController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/:id').get(this.albumController.get);

    this.router.route('/').post(this.albumController.create);
  }
}
