import express, {Router} from 'express';
import RateLimiter from '../config/rateLimit';
import AuthController from '../controllers/auth.controller';

export default class AuthRouter {
  router: Router;

  constructor(
    private readonly limiter: RateLimiter,
    private readonly authController: AuthController
  ) {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router
      .route('/login')
      .post(this.limiter.auth, this.authController.login);

    this.router
      .route('/register')
      .post(this.limiter.auth, this.authController.register);

    // this.router
    //   .route('/token')
    //   .get(this.limiter.auth, this.authController.token);
  }
}
