import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {IPlaylist} from '../models/playlist';
import {EStatusCode} from '../models/enums/statusCode';
import PlaylistRepository from '../repositories/playlist.repository';
import UserRepository from '../repositories/user.repository';
import { IUser } from '../models/user';

export default class UserController {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly userRepository: UserRepository) {}

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
  }

  getAll = async (req: Request, res: Response) => {
    const users = await this.userRepository.getAllUsers();

    const apiResponse = new ApiResponse<IUser[]>({data: users});
    res.status(EStatusCode.OK).send(apiResponse);
  }
  
  create = async (req: Request, res: Response) => {
    const user = req.body;
    const newUser = await this.userRepository.create(user);

    const apiResponse = new ApiResponse<IUser>({data: newUser});
    res.status(EStatusCode.CREATED).send(apiResponse);
  }
}
