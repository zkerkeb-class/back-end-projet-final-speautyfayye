import {Request, Response} from 'express';
import {ApiResponse} from '../models/other/apiResponse';
import {EStatusCode} from '../models/enums/statusCode';
import {TrackExt} from '../models/track';

export default class TrackController {
  constructor() {}

  get = async (req: Request, res: Response) => {
    const trackId = Number(req.params.id);

    const playlists: TrackExt = {
      id: trackId,
      title: 'Track 1',
      album_id: 1,
      album: {
        id: 1,
        title: 'Album 1',
        releaseDate: new Date(),
        category_id: 1,
        picture: undefined,
      },
      category_id: 1,
      category: {
        category_id: 1,
        name: 'Category 1',
      },
      duration: '400',
      releaseDate: new Date(),
      trackNumber: 1,
      picture: undefined,
    };

    const apiResponse = new ApiResponse<TrackExt>({data: playlists});
    res.status(EStatusCode.OK).send(apiResponse);
  };
}
