import dotenv from 'dotenv';

dotenv.config();

export const {PORT, DB_USER, DB_PWD, DB_NAME, DB_HOST, DB_PORT} = process.env;
