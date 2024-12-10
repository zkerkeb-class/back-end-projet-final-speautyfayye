import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { EStatusCode } from '../models/enums/statusCode';
import UserRepository from '../repositories/user.repository';
import { NewUser } from '../models/user';

export default class AuthController {
  fakeUsers = [
    {
      id: 1,
      username: "admin",
      email: 'admin@cdn.com',
      password: 'password',
    },
    {
      id: 2,
      username: "user",
      email: 'user@cdn.com',
      password: 'password',
    },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository) {}

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
    const { email, password, username } = req.body;
    if (!email || !password) {
      res.status(EStatusCode.BAD_REQUEST).json();
    } else {
      this.fakeUsers.push({ id: this.fakeUsers.length + 1, email, password, username });

      const tokens = {
        accessToken: this.authService.generateAccessToken(1),
        refreshToken: this.authService.generateRefreshToken(1),
      };

      this.userRepository.create({email, password, username} as NewUser);
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
