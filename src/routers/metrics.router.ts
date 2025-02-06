import express, { Router } from 'express';
import MetricsController from '../controllers/metrics.controller';

export default class MetricsRouter {
  router: Router;

  constructor(private readonly metricsController: MetricsController) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.route('/').get(this.metricsController.getMetrics);
    this.router.route('/requests').get(this.metricsController.getRequestStats);
  }
} 