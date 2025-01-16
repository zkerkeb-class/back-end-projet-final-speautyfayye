import {compare, hash} from 'bcryptjs';
import {Request} from 'express';
import {JwtPayload, sign, verify} from 'jsonwebtoken';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';

export const accessSecret = 'def';
export const refreshSecret = 'deffe';

export default class AuthService {
  async hashPassword(password: any): Promise<string> {
    return await hash(password, 10);
  }

  async check(password: string, cryptedPassword: string): Promise<boolean> {
    return await compare(password, cryptedPassword);
  }
  generateAccessToken(userId: number) {
    try {
      return sign({_id: userId}, accessSecret, {expiresIn: '2d'});
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
