import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import UserRepository from '../repositories/user.repository';
import AuthService from '../services/auth.service';
import AuthValidators from '../validators/auth.validators';

export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly authValidators: AuthValidators
  ) {}

  login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if (
      !this.authValidators.isEmailValid(email) ||
      !this.authValidators.isPasswordValid(password)
    ) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        logLevel: 'warn',
        message: 'Invalid email or password',
      });
    }

    const user = await this.userRepository.getIdAndPasswordByEmail(email);
    if (!user) {
      throw new Error(EStatusCode.NOT_FOUND);
    }

    if (!(await this.authService.check(password, user.password))) {
      throw new Error(EStatusCode.UNAUTHORIZED);
    }

    const tokens = {
      accessToken: this.authService.generateAccessToken(user.id, user.role),
      refreshToken: this.authService.generateRefreshToken(user.id),
    };
    res.status(EStatusCode.OK).json(tokens);
  };

  register = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if (
      !this.authValidators.isEmailValid(email) ||
      !this.authValidators.isPasswordValid(password)
    ) {
      throw new Error(EStatusCode.BAD_REQUEST, {
        logLevel: 'warn',
        message: 'Invalid email or password',
      });
    }

    if (await this.userRepository.getByEmail(email)) {
      throw new Error(EStatusCode.CONFLICT);
    }

    const hashedPassword = await this.authService.hashPassword(password);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      role: 'user',
    });

    if (!user) {
      throw new Error(EStatusCode.INTERNAL_SERVER_ERROR);
    }

    const tokens = {
      accessToken: this.authService.generateAccessToken(user.id, user.role),
      refreshToken: this.authService.generateRefreshToken(user.id),
    };

    res.status(EStatusCode.OK).json(tokens);
  };

  // token = async (req: Request, res: Response) => {
  //   const tokens = {
  //     accessToken: this.authService.generateAccessToken(1),
  //     refreshToken: this.authService.generateRefreshToken(1),
  //   };
  //   res.status(EStatusCode.OK).json(tokens);
  // };
}
