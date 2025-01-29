import express, {Router} from 'express';
import PlaylistController from '../controllers/playlist.controller';

export default class PlaylistRouter {
  router: Router;

  constructor(private readonly playlistController: PlaylistController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/').get(this.playlistController.getAll);
    this.router.route('/:id').get(this.playlistController.get);

    this.router.route('/').post(this.playlistController.create);
    this.router.route('/:id').delete(this.playlistController.delete);
    this.router.route('/:id').put(this.playlistController.update);

    this.router.route('/:id/track/').post(this.playlistController.addTrack);
    this.router
      .route('/:id/track/')
      .delete(this.playlistController.deleteTrack);
  }
}
