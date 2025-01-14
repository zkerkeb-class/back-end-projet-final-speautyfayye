export default class CorsMiddleware {
  allowedOrigins = ['http://example.com', 'http://localhost:3000'];
  options = {};

  constructor() {
    this.options = {
      origin: (origin: string | undefined, callback: Function) => {
        // if (!origin || this.allowedOrigins.includes(origin)) {
        callback(null, true);
        // } else {
        //   throw new Error(EStatusCode.FORBIDDEN);
        // }
      },
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
      maxAge: 300,
    };
  }
}
