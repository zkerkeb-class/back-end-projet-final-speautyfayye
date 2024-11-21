import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import RateLimiter from './config/rateLimit';
import helmet from 'helmet';
import compression from 'compression';

const limiter = new RateLimiter();

const app: Express = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(limiter.global);

export default app;
