import express, {Request, Router} from 'express';
import multer from 'multer';
import path from 'node:path';
import AudioController from '../controllers/audio.controller';
import CacheMiddleware from '../middleware/cache.middleware';

const allowedExtensions = ['.mp3'];

export default class AudioRouter {
  private readonly multer = multer({
    fileFilter: this.fileFilter,
    limits: {
      fileSize: 10000000,
    },
  });
  router: Router;

  constructor(
    private readonly audioController: AudioController,
    private readonly cacheMiddleware: CacheMiddleware
  ) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router
      .route('/upload')
      .post(this.multer.array('files'), this.audioController.upload);

    this.router
      .route('/:id')
      .get(this.cacheMiddleware.get, this.audioController.get);
  }

  private fileFilter(
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) {
    var ext = path.extname(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      return callback(new Error('Only mp3 are allowed'));
    }
    callback(null, true);
  }
}
