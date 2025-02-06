import {NextFunction, Request, Response} from 'express';
import AuthService from '../services/auth.service';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';

export default class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}

  isLogged = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const accessToken = this.authService.getAccessToken(req);
    if (!accessToken) {
      throw new Error(EStatusCode.UNAUTHORIZED);
    }
    res.locals.user = await this.authService.verifyAccessToken(accessToken);
    next();
  };

  isAnonymous = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const accessToken = this.authService.getAccessToken(req);
    if (accessToken) {
      throw new Error(EStatusCode.UNAUTHORIZED);
    }
    return next();
  };

  // isRefreshTokenValid = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) => {
  //   const refreshToken = this.authService.getRefreshToken(req);
  //   if (!refreshToken) {
  //     throw new Error(EStatusCode.UNAUTHORIZED);
  //   }
  //   const payload = await this.authService.verifyRefreshToken(refreshToken);

  //   res.locals.refreshTokenPayload = payload;
  //   res.locals.refreshToken = refreshToken;
  //   return next();
  // };
}
