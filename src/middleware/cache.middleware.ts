import {NextFunction, Request, Response} from 'express';
import NodeCache from 'node-cache';
import {Stream} from 'stream';

export const cache = new NodeCache({stdTTL: 60});

export default class CacheMiddleware {
  get = async (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
      if (cachedData instanceof Stream.Readable) {
        cachedData.pipe(res);
      } else {
        res.json(cachedData);
      }
    }
    next();
  };
}
