import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {Express} from 'express';
import helmet from 'helmet';
import RateLimiter from './config/rateLimit';

import UploadRepository from './repositories/upload.repository';

// import MeasureRequestTime from './middleware/request-timer.middleware';

import ArtistService from './services/artist.service';
import AudioService from './services/audio.service';
import ConvertService from './services/convert.service';
import ImageService from './services/image.service';

import AudioController from './controllers/audio.controller';
import ErrorController from './controllers/error.controller';
import ImageController from './controllers/image.controller';

import AuthController from './controllers/auth.controller';
import AuthMiddleware from './middleware/auth.middleware';
import CacheMiddleware from './middleware/cache.middleware';
import CorsMiddleware from './middleware/cors.middleware';
import LogRepository from './repositories/log.repository';
import AudioRouter from './routers/audio.router';
import AuthRouter from './routers/auth.router';
import ImageRouter from './routers/image.router';
import AuthService from './services/auth.service';

import swaggerUi from 'swagger-ui-express';
import {migrateToLatest} from './config/db/db';
import AlbumController from './controllers/album.controller';
import ArtistController from './controllers/artist.controller';
import CategoryController from './controllers/category.controller';
import PlaylistController from './controllers/playlist.controller';
import SearchController from './controllers/search.controller';
import TrackController from './controllers/track.controller';
import UserController from './controllers/user.controller';
import AlbumRepository from './repositories/album.repository';
import ArtistRepository from './repositories/artist.repository';
import CategoryRepository from './repositories/category.repository';
import FileRepository from './repositories/file.repository';
import PlaylistRepository from './repositories/playlist.repository';
import SearchRepository from './repositories/search.repository';
import TrackRepository from './repositories/track.repository';
import UserRepository from './repositories/user.repository';
import AlbumRouter from './routers/album.router';
import ArtistRouter from './routers/artist.router';
import CategoryRouter from './routers/category.router';
import PlaylistRouter from './routers/playlist.router';
import SearchRouter from './routers/search.router';
import TrackRouter from './routers/track.router';
import UserRouter from './routers/user.router';
import swaggerOutput from './swagger_output.json';
import AuthValidators from './validators/auth.validators';

const limiter = new RateLimiter();
const corsMiddleware = new CorsMiddleware();
// const measureRequestTime = new MeasureRequestTime();

const app: Express = express();
app.use(helmet());
app.use(cors(corsMiddleware.options));
app.use(compression());
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
// app.use(measureRequestTime.get);
// app.use(limiter.global);

migrateToLatest();

//#region Repositories
const logRepository = new LogRepository();
const fileRepository = new FileRepository();
const uploadRepository = new UploadRepository(logRepository);
const trackRepository = new TrackRepository();
const albumRepository = new AlbumRepository();
const categoryRepository = new CategoryRepository();
const playlistRepository = new PlaylistRepository();
const userRepository = new UserRepository();
const artistRepository = new ArtistRepository();
const searchRepository = new SearchRepository();
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

//#region Validators
const authValidators = new AuthValidators();
//#endregion

//#region Middlewares
const authMiddleware = new AuthMiddleware(authService);
const cacheMiddleware = new CacheMiddleware();
//#endregion

//#region Controllers
const authController = new AuthController(
  authService,
  userRepository,
  authValidators
);
const fileController = new ImageController(
  uploadService,
  trackRepository,
  albumRepository,
  artistRepository
);
const audioController = new AudioController(audioService, trackRepository);
const errorController = new ErrorController(logRepository);
const userController = new UserController(
  playlistRepository,
  userRepository,
  authService,
  authValidators
);
const playlistController = new PlaylistController(playlistRepository);
const trackController = new TrackController(trackRepository);
const albumController = new AlbumController(albumRepository);
const categoryController = new CategoryController(categoryRepository);
const artistController = new ArtistController(artistRepository);
const searchController = new SearchController(searchRepository);
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
const searchRouter = new SearchRouter(searchController);
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
app.use('/search', searchRouter.router);
app.use(errorController.errorHandler);
//#endregion

export default app;
