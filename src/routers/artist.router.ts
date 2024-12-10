import express, {Router} from 'express';
import ArtistController from '../controllers/artist.controller';

export default class ArtistRouter {
  router: Router;

  constructor(private readonly artistController: ArtistController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router
        .route('/')
        .get(this.artistController.getAll);

    this.router
        .route('/:id')
        .get(this.artistController.getById);
    
    this.router
        .route('/:name')
        .get(this.artistController.getByName);
    
    this.router
        .route('/')
        .post(this.artistController.create);
    
    this.router 
        .route('/:id')
        .put(this.artistController.update);

    this.router
        .route('/:id')
        .delete(this.artistController.delete);
    
  }
}
