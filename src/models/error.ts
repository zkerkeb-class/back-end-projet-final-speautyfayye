import {EStatusCode} from './enums/statusCode';

interface IErrorOptions {
  message: any;
}

export class Error {
  status: EStatusCode;
  message?: any;

  constructor(status?: EStatusCode, options?: Partial<IErrorOptions>) {
    this.status = status ?? EStatusCode.INTERNAL_SERVER_ERROR;
    this.message = options?.message;
  }
}
