export interface IApiResponseSuccess<T> {
  data: T;
}

export interface IApiResponseFail {
  // hint: EErrorHint;
}

type ApiResponseType<T> = IApiResponseSuccess<T> | IApiResponseFail;

export interface IApiResponse {
  data?: any;
  // hint?: EErrorHint;
}

export class ApiResponse<T> implements IApiResponse {
  data?: T;
  // hint?: EErrorHint;

  constructor(response?: ApiResponseType<T>) {
    // if (response && 'hint' in response) {
    //   this.hint = response.hint;
    // }
    if (response && 'data' in response) {
      this.data = response?.data;
    }
  }
}
