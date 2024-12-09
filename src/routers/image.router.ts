import express, {Router} from 'express';
import multer from 'multer';
import ImageController from '../controllers/image.controller';
import AuthMiddleware from '../middleware/auth.middleware';
import CacheMiddleware from '../middleware/cache.middleware';

export default class ImageRouter {
  router: Router;
  multer = multer({
    limits: {
      fileSize: 1024 * 1024,
    },
  });

  constructor(
    private readonly imageController: ImageController,
    private readonly authMiddleware: AuthMiddleware,
    private readonly cacheMiddleware: CacheMiddleware
  ) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router
      .route('/upload/:entityTypeId/:entityId')
      .post(this.multer.array('files'), this.imageController.upload);

    this.router
      .route('/:name/:size/:ext')
      .get(this.cacheMiddleware.get, this.imageController.get);
  }
}
