import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import RateLimiter from './config/rateLimit';
import helmet from 'helmet';
import compression from 'compression';

import UploadRepository from './repositories/upload.repository';

import ConvertService from './services/convert.service';
import ImageService from './services/image.service';
import AudioService from './services/audio.service';

import ImageController from './controllers/image.controller';
import ErrorController from './controllers/error.controller';
import AudioController from './controllers/audio.controller';

import ImageRouter from './routers/image.router';
import AudioRouter from './routers/audio.router';
import CacheMiddleware from './middleware/cache.middleware';
import CorsMiddleware from './middleware/cors.middleware';
import AuthService from './services/auth.service';
import AuthRouter from './routers/auth.router';
import AuthController from './controllers/auth.controller';
import AuthMiddleware from './middleware/auth.middleware';
import LogRepository from './repositories/log.repository';

import swaggerUi from 'swagger-ui-express';
import swaggerOutput from './swagger_output.json';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import {migrateToLatest} from './config/db/db';

const options = {
  definition: {
    openapi: '3.0.0',
  },
  info: {
    version: '1.0.0',
    title: 'Albums store',
    license: {
      name: 'MIT',
    },
  },
  security: {
    BasicAuth: {
      type: 'http',
      scheme: 'basic',
    },
  },
  // Base directory which we use to locate your JSDOC files
  baseDir: __dirname,
  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  filesPattern: './routers/*.ts',
  // URL where SwaggerUI will be rendered
  swaggerUIPath: '/swagger',
  // Expose OpenAPI UI
  exposeSwaggerUI: true,
  // Expose Open API JSON Docs documentation in `apiDocsPath` path.
  exposeApiDocs: false,
  // Open API JSON Docs endpoint.
  apiDocsPath: '/v3/api-docs',
  // Set non-required fields as nullable by default
  notRequiredAsNullable: false,
  // You can customize your UI options.
  // you can extend swagger-ui-express config. You can checkout an example of this
  // in the `example/configuration/swaggerOptions.js`
  swaggerUiOptions: {},
  // multiple option in case you want more that one instance
  multiple: true,
};

const limiter = new RateLimiter();
const corsMiddleware = new CorsMiddleware();

const app: Express = express();
app.use(helmet());
app.use(cors(corsMiddleware.options));
app.use(compression());
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(limiter.global);

expressJSDocSwagger(app)(options);

migrateToLatest();

//#region Repositories
const logRepository = new LogRepository();
const uploadRepository = new UploadRepository(logRepository);
//#endregion

//#region Services
const authService = new AuthService();
const convertService = new ConvertService();
const uploadService = new ImageService(uploadRepository, convertService);
const audioService = new AudioService(uploadRepository, convertService);
//#endregion

//#region Middlewares
const authMiddleware = new AuthMiddleware(authService);
const cacheMiddleware = new CacheMiddleware();
//#endregion

//#region Controllers
const authController = new AuthController(authService);
const fileController = new ImageController(uploadService);
const audioController = new AudioController(audioService);
const errorController = new ErrorController(logRepository);
//#endregion

//#region Routers
const authRouter = new AuthRouter(limiter, authController);
const fileRouter = new ImageRouter(
  fileController,
  authMiddleware,
  cacheMiddleware
);
const audioRouter = new AudioRouter(audioController);
//#endregion

//#region Endpoints
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use('/auth', authRouter.router);
app.use('/file', fileRouter.router);
app.use('/audio', audioRouter.router);
app.use(errorController.errorHandler);
//#endregion

export default app;
