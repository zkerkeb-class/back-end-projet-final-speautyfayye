import { Error } from '../models/error';
import { EStatusCode } from '../models/enums/statusCode';
import LogRepository from '../repositories/log.repository';

export default class ErrorController {
  constructor(private readonly logRepository: LogRepository) {}

  errorHandler = async (error: unknown, req: any, res: any, next: any) => {
    this.logRepository.insertError(error);

    const err = error as Error;
    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(EStatusCode.INTERNAL_SERVER_ERROR).json(error);
  };
}
