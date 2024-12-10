import express, {Router} from 'express';
import TrackController from '../controllers/track.controller';

// Page d'accueil

// Mes playlists
// Les 10 derniers sons
// Les 10 artistes populaires
// Les 10 derniers albums

// Page de recherche

// Search
// Catégories

export default class TrackRouter {
  router: Router;

  constructor(private readonly trackController: TrackController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/:id').get(this.trackController.get);

    this.router.route('/').post(this.trackController.create);
  }
}
