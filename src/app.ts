import express, {Express} from 'express';
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

const limiter = new RateLimiter();
const corsMiddleware = new CorsMiddleware();

const app: Express = express();
app.use(helmet());
app.use(cors(corsMiddleware.options));
app.use(compression());
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(limiter.global);

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
app.use('/auth', authRouter.router);
app.use('/file', fileRouter.router);
app.use('/audio', audioRouter.router);
app.use(errorController.errorHandler);
//#endregion

export default app;
