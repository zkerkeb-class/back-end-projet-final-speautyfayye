import express, {Router} from 'express';
import UserController from '../controllers/user.controller';

export default class UserRouter {
  router: Router;

  constructor(private readonly userController: UserController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/').get(this.userController.getAll);
    this.router.route('/playlists/:id').get(this.userController.getPlaylists);
    this.router.route('/:id').get(this.userController.getUser);
    this.router.route('/').put(this.userController.updateUser);
  }
}
