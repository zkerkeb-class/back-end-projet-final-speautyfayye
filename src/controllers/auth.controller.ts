import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { EStatusCode } from '../models/enums/statusCode';

export default class AuthController {
  fakeUsers = [
    {
      id: 1,
      email: 'admin@cdn.com',
      password: 'password',
    },
    {
      id: 2,
      email: 'user@cdn.com',
      password: 'password',
    },
  ];

  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (
      this.fakeUsers.find((u) => u.email === email && u.password === password)
    ) {
      const tokens = {
        accessToken: this.authService.generateAccessToken(1),
        refreshToken: this.authService.generateRefreshToken(1),
      };
      res.status(EStatusCode.OK).json(tokens);
    } else {
      res.status(EStatusCode.BAD_REQUEST).json();
    }
  };

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(EStatusCode.BAD_REQUEST).json();
    } else {
      this.fakeUsers.push({ id: this.fakeUsers.length + 1, email, password });

      const tokens = {
        accessToken: this.authService.generateAccessToken(1),
        refreshToken: this.authService.generateRefreshToken(1),
      };
      res.status(EStatusCode.OK).json(tokens);
    }
  };

  token = async (req: Request, res: Response) => {
    const tokens = {
      accessToken: this.authService.generateAccessToken(1),
      refreshToken: this.authService.generateRefreshToken(1),
    };
    res.status(EStatusCode.OK).json(tokens);
  };
}
