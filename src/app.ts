import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import RateLimiter from './config/rateLimit';
import { cache } from './middleware/cache.middleware';
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
import MetricsController from './controllers/metrics.controller';
import PlaylistController from './controllers/playlist.controller';
import SearchController from './controllers/search.controller';
import TrackController from './controllers/track.controller';
import UserController from './controllers/user.controller';
import MeasureRequestTime from './middleware/request-timer.middleware';
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
import MetricsRouter from './routers/metrics.router';
import PlaylistRouter from './routers/playlist.router';
import SearchRouter from './routers/search.router';
import TrackRouter from './routers/track.router';
import UserRouter from './routers/user.router';
import swaggerOutput from './swagger_output.json';
import AuthValidators from './validators/auth.validators';

import {createServer} from 'http';
import {Server} from 'socket.io';

import { db } from './config/db/db';
const limiter = new RateLimiter();
const corsMiddleware = new CorsMiddleware();
const measureRequestTime = new MeasureRequestTime();

const app = express();
const httpServer = createServer(app);
app.use(helmet());
app.use(cors(corsMiddleware.options));
app.use(compression());
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(measureRequestTime.get);
// app.use(limiter.global);

interface TrackDetails {
  id: number;
  title: string;
  artist_name: string | null;
  duration: number | undefined;
  album_title: string;
  audio: string;
}
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false,
  },
});
io.on('connection', socket => {
  socket.on('connect', socket => {
    console.log('Client connected', socket);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('action', action => {
    console.log('🚀 ~ action:', action);
    io.to(action.groupId).emit('action', action);
  });

  socket.on('track', ({currentTrack, nextTracksList, groupId}) => {
    console.log('🚀 ~ listen track:', groupId, currentTrack.title);
    io.to(groupId).emit('track', {currentTrack, nextTracksList, groupId});
  });

  socket.on('join', ({groupId, socketId}) => {
    io.to(groupId).emit('sync', {groupId, socketId});
    console.log('🚀 ~ joining:', groupId, socketId);
    socket.join(groupId);
  });
  
  socket.on(
    'sync',
    ({
      currentTrack,
      nextTracksList,
      groupId,
      currentTime,
      socketId,
      playing,
    }) => {
      io.to(groupId).emit('syncClient', {
        currentTrack,
        nextTracksList,
        groupId,
        currentTime,
        socketId,
        playing,
      });
    }
  );
  
  socket.join('trackHistory');
  socket.on('trackHistory', async ({ 
    trackId, 
    trackTitle, 
    trackDuration, 
    trackAlbumTitle,
    trackArtistName,
    trackAudio}) => {
    try {
      
      const cacheKey = `trackHistory`;
      let trackHistory = await cache.get(cacheKey) as TrackDetails[] || [];
      const index = trackHistory.findIndex((track) => track.id === trackId);
      if(index !== -1) {
        trackHistory.splice(index, 1);
      }
      trackHistory.unshift({
        id: trackId,
        title: trackTitle,
        artist_name: trackArtistName,
        duration: trackDuration,
        album_title: trackAlbumTitle,
        audio: trackAudio
      });
      trackHistory = trackHistory.slice(0, 20);
      cache.set(cacheKey, trackHistory, 3600);
      io.to('trackHistory').emit('trackHistory', {
        trackHistory: trackHistory
      });

      const track = await trackRepository.getById(trackId);
      if(track) {
        const updatedTrack = await trackRepository.updateById(trackId, {
          number_of_plays: Number(track.number_of_plays) + 1
        });
      }

    } catch (error) {
      io.to('trackHistory').emit('error', {message: 'Error fetching track details'});
    }
  });
});

// if (!isTest) {
migrateToLatest();
// }

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
const playlistController = new PlaylistController(
  playlistRepository,
  logRepository
);
const trackController = new TrackController(trackRepository);
const albumController = new AlbumController(albumRepository, trackRepository);
const categoryController = new CategoryController(categoryRepository);
const artistController = new ArtistController(artistRepository);
const searchController = new SearchController(searchRepository);
const metricsController = new MetricsController();
//#endregion

//#region Routers
const authRouter = new AuthRouter(limiter, authController);
const fileRouter = new ImageRouter(
  fileController,
  authMiddleware,
  cacheMiddleware
);
const audioRouter = new AudioRouter(audioController, cacheMiddleware);
const userRouter = new UserRouter(userController);
const playlistRouter = new PlaylistRouter(playlistController, cacheMiddleware);
const trackRouter = new TrackRouter(trackController);
const albumRouter = new AlbumRouter(albumController, cacheMiddleware);
const categoryRouter = new CategoryRouter(categoryController);
const artistRouter = new ArtistRouter(artistController, cacheMiddleware);
const searchRouter = new SearchRouter(searchController);
const metricsRouter = new MetricsRouter(metricsController);
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
app.use('/metrics', metricsRouter.router);
app.use(errorController.errorHandler);
//#endregion

export default httpServer;
