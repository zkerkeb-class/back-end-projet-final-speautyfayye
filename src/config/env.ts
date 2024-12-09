import dotenv from 'dotenv';

dotenv.config();

export const isLocal = process.env.APP_ENV === 'local';
export const isTest = !isLocal || process.env.NODE_ENV === 'test';

export const {PORT, DB_USER, DB_PWD, DB_NAME, DB_HOST, DB_PORT} = process.env;
