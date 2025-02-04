import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import LogRepository from '../repositories/log.repository';

export default class ErrorController {
  constructor(private readonly logRepository: LogRepository) {}

  errorHandler = async (error: unknown, req: any, res: any, next: any) => {
    // console.error('🚀 ~ ErrorController ~ errorHandler= ~ error:', error);

    if ('level' in (error as any)) {
      const err = error as any & {level: string};
      if (err.level === 'info') {
        this.logRepository.logger.info(err.level, err.message);
      } else if (err.level === 'warn') {
        this.logRepository.logger.warn(err.level, err.message);
      } else if (err.level === 'error') {
        this.logRepository.logger.error(err.level, err.message);
      } else if (err.level === 'debug') {
        this.logRepository.logger.debug(err.level, err.message);
      }
    }

    const err = error as Error;
    if (err.status) {
      return res.status(err.status).json(err);
    }

    return res.status(EStatusCode.INTERNAL_SERVER_ERROR).json(error);
  };
}
