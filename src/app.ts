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
import ArtistService from './services/artist.service';

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
import {migrateToLatest} from './config/db/db';
import UserRouter from './routers/user.router';
import UserController from './controllers/user.controller';
import PlaylistController from './controllers/playlist.controller';
import PlaylistRouter from './routers/playlist.router';
import TrackRouter from './routers/track.router';
import TrackController from './controllers/track.controller';
import TrackRepository from './repositories/track.repository';
import AlbumRouter from './routers/album.router';
import AlbumController from './controllers/album.controller';
import AlbumRepository from './repositories/album.repository';
import CategoryRepository from './repositories/category.repository';
import CategoryController from './controllers/category.controller';
import CategoryRouter from './routers/category.router';
import FileRepository from './repositories/file.repository';
import ArtistRouter from './routers/artist.router';
import ArtistController from './controllers/artist.controller';
import PlaylistRepository from './repositories/playlist.repository';

const limiter = new RateLimiter();
const corsMiddleware = new CorsMiddleware();

const app: Express = express();
app.use(helmet());
app.use(cors(corsMiddleware.options));
app.use(compression());
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(limiter.global);

migrateToLatest();

//#region Repositories
const logRepository = new LogRepository();
const fileRepository = new FileRepository();
const uploadRepository = new UploadRepository(logRepository);
const trackRepository = new TrackRepository();
const albumRepository = new AlbumRepository();
const categoryRepository = new CategoryRepository();
const playlistRepository = new PlaylistRepository();
//#endregion

//#region Services
const authService = new AuthService();
const convertService = new ConvertService();
const uploadService = new ImageService(
  uploadRepository,
  fileRepository,
  convertService
);
const audioService = new AudioService(
  uploadRepository,
  fileRepository,
  convertService
);
const artistService = new ArtistService();

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
const userController = new UserController();
const playlistController = new PlaylistController(playlistRepository);
const trackController = new TrackController(trackRepository);
const albumController = new AlbumController(albumRepository);
const categoryController = new CategoryController(categoryRepository);
const artistController = new ArtistController(artistService);
//#endregion

//#region Routers
const authRouter = new AuthRouter(limiter, authController);
const fileRouter = new ImageRouter(
  fileController,
  authMiddleware,
  cacheMiddleware
);
const audioRouter = new AudioRouter(audioController);
const userRouter = new UserRouter(userController);
const playlistRouter = new PlaylistRouter(playlistController);
const trackRouter = new TrackRouter(trackController);
const albumRouter = new AlbumRouter(albumController);
const categoryRouter = new CategoryRouter(categoryController);
const artistRouter = new ArtistRouter(artistController);
//#endregion

//#region Endpoints
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use('/auth', authRouter.router);
app.use('/file', fileRouter.router);
app.use('/audio', audioRouter.router);
app.use('/user', userRouter.router);
app.use('/playlist', playlistRouter.router);
app.use('/track', trackRouter.router);
app.use('/album', albumRouter.router);
app.use('/category', categoryRouter.router);
app.use('/artist', artistRouter.router);
app.use(errorController.errorHandler);
//#endregion

export default app;
