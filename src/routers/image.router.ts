import express, {Router} from 'express';
import ImageController from '../controllers/image.controller';
import multer from 'multer';
import CacheMiddleware from '../middleware/cache.middleware';
import AuthMiddleware from '../middleware/auth.middleware';

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
    /**
     * POST /image/upload
     * @summary Uploader une image
     */
    this.router.route('/upload').post(
      this.multer.array('files'),
      // this.authMiddleware.isLogged,
      this.imageController.upload
    );

    // @JSDoc
    /**
     * GET /:name/:size/:ext
     * @summary Récupération d'une image
     *
     * @typedef {object} showRequestBody
     * @property {string} name this is name in request body
     * @property {number} age this is age in request body
     *
     * @typedef {object} showRequestQuery
     * @property {string} name this is name in query
     * @property {number} age this is age in query
     *
     * @param {string} size.size - taille souhaitée
     * @param {string} ext.ext - extension souhaitée
     *
     * @param {import('express').Request<{}, {}, showRequestBody, showRequestQuery>} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    this.router
      .route('/:name/:size/:ext')
      .get(this.cacheMiddleware.get, this.imageController.get);
  }
}
