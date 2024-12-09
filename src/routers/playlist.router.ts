import express, {Router} from 'express';
import PlaylistController from '../controllers/playlist.controller';

export default class PlaylistRouter {
  router: Router;

  constructor(private readonly playlistController: PlaylistController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/:id').get(this.playlistController.get);
  }
}
