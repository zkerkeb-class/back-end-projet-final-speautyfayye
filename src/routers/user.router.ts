import express, {Router} from 'express';
import UserController from '../controllers/user.controller';

// Page d'accueil

// Mes playlists
// Les 10 derniers sons
// Les 10 artistes populaires
// Les 10 derniers albums

// Page de recherche

// Search
// Catégories

export default class UserRouter {
  router: Router;

  constructor(private readonly userController: UserController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/playlists/:id').get(this.userController.getPlaylists);
  }
}
