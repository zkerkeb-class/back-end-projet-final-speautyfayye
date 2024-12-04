import { EStatusCode } from './enums/statusCode';

interface IErrorOptions {
  message: string;
}

export class Error {
  status: EStatusCode;
  message?: string;

  constructor(status?: EStatusCode, options?: Partial<IErrorOptions>) {
    this.status = status ?? EStatusCode.INTERNAL_SERVER_ERROR;
    this.message = options?.message;
  }
}
