import {EStatusCode} from './enums/statusCode';

interface IErrorOptions {
  message: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug' | undefined;
}

export class Error {
  status: EStatusCode;
  message?: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug' | undefined;

  constructor(status?: EStatusCode, options?: Partial<IErrorOptions>) {
    this.status = status ?? EStatusCode.INTERNAL_SERVER_ERROR;
    this.message = options?.message;
    this.logLevel = options?.logLevel;
  }
}
