import {JwtPayload, sign, verify} from 'jsonwebtoken';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import {Request} from 'express';

const accessSecret = 'def';
const refreshSecret = 'deffe';

export default class AuthService {
  generateAccessToken(userId: number) {
    try {
      return sign({_id: userId}, accessSecret, {expiresIn: '5m'});
    } catch (error) {
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  generateRefreshToken(userId: number) {
    try {
      return sign({_id: userId}, refreshSecret, {expiresIn: '7d'});
    } catch (error) {
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyAccessToken(
    token: string
  ): Promise<string | JwtPayload | undefined> {
    try {
      return verify(token, accessSecret);
    } catch (error) {
      throw new Error(EStatusCode.UNAUTHORIZED);
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return verify(token, refreshSecret) as JwtPayload;
    } catch (error) {
      throw new Error(EStatusCode.UNAUTHORIZED);
    }
  }

  getAccessToken(req: Request): string | undefined {
    let token = req.headers.authorization;
    return token?.replace('Bearer ', '');
  }

  getRefreshToken(req: Request): string | undefined {
    const token = req.headers['refresh-token'];
    return token as string;
  }
}
