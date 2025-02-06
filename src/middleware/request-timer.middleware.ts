import { NextFunction, Request, Response } from 'express';

interface RequestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsByEndpoint: {
    [key: string]: {
      total: number;
      successful: number;
      failed: number;
      totalDuration: number;
      averageResponseTime: number;
      dbQueries: {
        total: number;
        totalDuration: number;
        averageQueryTime: number;
      };
    };
  };
  dbQueries: {
    total: number;
    totalDuration: number;
    averageQueryTime: number;
  };
}

export default class MeasureRequestTime {
  private static stats: RequestStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    requestsByEndpoint: {},
    dbQueries: {
      total: 0,
      totalDuration: 0,
      averageQueryTime: 0
    }
  };

  private static currentRequest: string | null = null;

  public static getStats(): RequestStats {
    return this.stats;
  }

  public static addDbQueryTime(duration: number) {
    this.stats.dbQueries.total++;
    this.stats.dbQueries.totalDuration += duration;
    this.stats.dbQueries.averageQueryTime = 
      this.stats.dbQueries.totalDuration / this.stats.dbQueries.total;

    // Ajouter le temps de requête à l'endpoint courant
    if (this.currentRequest && this.stats.requestsByEndpoint[this.currentRequest]) {
      const endpoint = this.stats.requestsByEndpoint[this.currentRequest];
      endpoint.dbQueries.total++;
      endpoint.dbQueries.totalDuration += duration;
      endpoint.dbQueries.averageQueryTime = 
        endpoint.dbQueries.totalDuration / endpoint.dbQueries.total;
    }
  }

  get = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const path = req.path;
    MeasureRequestTime.currentRequest = path;

    if (!MeasureRequestTime.stats.requestsByEndpoint[path]) {
      MeasureRequestTime.stats.requestsByEndpoint[path] = {
        total: 0,
        successful: 0,
        failed: 0,
        totalDuration: 0,
        averageResponseTime: 0,
        dbQueries: {
          total: 0,
          totalDuration: 0,
          averageQueryTime: 0
        }
      };
    }

    MeasureRequestTime.stats.totalRequests++;
    MeasureRequestTime.stats.requestsByEndpoint[path].total++;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const endpoint = MeasureRequestTime.stats.requestsByEndpoint[path];

      endpoint.totalDuration += duration;
      endpoint.averageResponseTime = endpoint.totalDuration / endpoint.total;

      if (statusCode >= 200 && statusCode < 400) {
        MeasureRequestTime.stats.successfulRequests++;
        endpoint.successful++;
      } else {
        MeasureRequestTime.stats.failedRequests++;
        endpoint.failed++;
      }

      console.info(`${req.method} ${req.path} ${statusCode} ${duration}ms`);
      MeasureRequestTime.currentRequest = null;
    });

    next();
  };
}
