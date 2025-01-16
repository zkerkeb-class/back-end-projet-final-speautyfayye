import winston from 'winston';

export default class LogRepository {
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({filename: 'error.log', level: 'warn'}),
    ],
  });
}
