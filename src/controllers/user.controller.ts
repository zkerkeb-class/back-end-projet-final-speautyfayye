import {Request, Response} from 'express';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylist} from '../models/playlist';
import {IUser} from '../models/user';
import PlaylistRepository from '../repositories/playlist.repository';
import UserRepository from '../repositories/user.repository';
import AuthService from '../services/auth.service';
import AuthValidators from '../validators/auth.validators';

export default class UserController {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly authValidators: AuthValidators
  ) {}

  getPlaylists = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const playlists = await this.playlistRepository.getByUserId(Number(userId));

    const apiResponse = new ApiResponse<IPlaylist[]>({data: playlists});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  getUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await this.userRepository.getById(Number(userId));

    const apiResponse = new ApiResponse<IUser>({data: user});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  getAll = async (req: Request, res: Response) => {
    const users = await this.userRepository.getAllUsers();

    const apiResponse = new ApiResponse<IUser[]>({data: users});
    res.status(EStatusCode.OK).send(apiResponse);
  };

  create = async (req: Request, res: Response) => {
    const user = req.body;
    const newUser = await this.userRepository.create(user);

    const apiResponse = new ApiResponse<IUser>({data: newUser});
    res.status(EStatusCode.CREATED).send(apiResponse);
  };

  updateUser = async (req: Request, res: Response) => {
    const token = this.authService.getAccessToken(req);
    if (!token) {
      throw new Error(EStatusCode.UNAUTHORIZED);
    }
    const {id, role} = await this.authService.verifyAccessToken(token);

    const {email, password} = req.body;
    if (email) {
      if (!this.authValidators.isEmailValid(email)) {
        throw new Error(EStatusCode.BAD_REQUEST);
      }
    }
    if (password) {
      if (!this.authValidators.isPasswordValid(password)) {
        throw new Error(EStatusCode.BAD_REQUEST);
      }
      req.body.hashedPassword = this.authService.hashPassword(password);
    }

    const updatedUser = await this.userRepository.update(id, {
      ...req.body,
      id,
      role,
    });

    const apiResponse = new ApiResponse<IUser>({data: updatedUser});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
