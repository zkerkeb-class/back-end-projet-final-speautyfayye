import express, {Request, Router} from 'express';
import ImageController from '../controllers/image.controller';
import multer from 'multer';
import path from 'node:path';
import CacheMiddleware from '../middleware/cache.middleware';
import AuthMiddleware from '../middleware/auth.middleware';

const allowedExtensions = ['.png', '.jpg', '.webp', '.jpeg'];

export default class ImageRouter {
  router: Router;
  multer = multer({
    fileFilter: this.fileFilter,
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
      .route('/upload')
      .post(this.multer.array('files'), this.imageController.upload);

    this.router
      .route('/:name/:size/:ext')
      .get(this.cacheMiddleware.get, this.imageController.get);
  }

  private fileFilter(
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) {
    var ext = path.extname(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  }
}
