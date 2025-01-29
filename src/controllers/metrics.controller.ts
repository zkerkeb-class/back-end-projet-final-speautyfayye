import { Request, Response } from 'express';
import { EStatusCode } from '../models/enums/statusCode';
import { ApiResponse } from '../models/other/apiResponse';
import MeasureRequestTime from '../middleware/request-timer.middleware';

export default class MetricsController {
  getMetrics = async (_req: Request, res: Response) => {
    const usage = process.memoryUsage();
    const metrics = {
      memory: {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      },
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    const apiResponse = new ApiResponse({data: metrics});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  getRequestStats = async (_req: Request, res: Response) => {
    const stats = MeasureRequestTime.getStats();
    const successRate = stats.totalRequests > 0 
      ? (stats.successfulRequests / stats.totalRequests * 100).toFixed(2)
      : '0';

    const statsWithRates = {
      totalRequests: stats.totalRequests,
      successfulRequests: stats.successfulRequests,
      failedRequests: stats.failedRequests,
      successRate: `${successRate}%`,
      failureRate: `${(100 - parseFloat(successRate)).toFixed(2)}%`,
      requestsByEndpoint: Object.entries(stats.requestsByEndpoint).map(([endpoint, data]) => ({
        endpoint,
        total: data.total,
        successful: data.successful,
        failed: data.failed,
        totalDuration: data.totalDuration,
        averageResponseTime: `${data.averageResponseTime.toFixed(2)}ms`,
        successRate: `${(data.successful / data.total * 100).toFixed(2)}%`,
        dbQueries: {
          totalQueries: data.dbQueries.total,
          averageQueryTime: `${data.dbQueries.averageQueryTime.toFixed(2)}ms`,
          totalQueryTime: `${data.dbQueries.totalDuration}ms`
        }
      })),
      totalDbQueries: {
        totalQueries: stats.dbQueries.total,
        averageQueryTime: `${stats.dbQueries.averageQueryTime.toFixed(2)}ms`,
        totalQueryTime: `${stats.dbQueries.totalDuration}ms`
      }
    };

    const apiResponse = new ApiResponse({data: statsWithRates});
    res.status(EStatusCode.OK).send(apiResponse);
  };
} 