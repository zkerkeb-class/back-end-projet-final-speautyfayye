import { EStatusCode } from '../models/enums/statusCode';
import { Error as CustomError } from '../models/error';
import fs from 'node:fs';

export default class LogRepository {
  insertError(error: CustomError | unknown): void {
    try {
      console.error('inserting...', error);
      if ((error as CustomError).status) {
        fs.appendFileSync(
          'ressources/logs/log.txt',
          `${(error as CustomError).status} - ${
            (error as CustomError).message
          }\n`,
        );
      } else {
        let message = 'UNKNOW ERROR';
        if ((error as unknown as Error).message) {
          message =
            (error as unknown as Error).name +
            ' ' +
            (error as unknown as Error).message +
            ' ' +
            (error as unknown as Error).stack;
        }
        fs.appendFileSync('ressources/logs/log.txt', `UNKNOWN - ${message}\n`);
      }
    } catch (error) {
      // Rien ici
    }
  }

  insert(status: EStatusCode, message?: string) {
    fs.appendFileSync('ressources/logs/log.txt', `${status} - ${message}\n`);
  }
}
