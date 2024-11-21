import {DB_HOST, DB_NAME, DB_PWD, DB_USER, DB_PORT} from '../env';
import {FileMigrationProvider, Kysely, Migrator, PostgresDialect} from 'kysely';
import {Pool} from 'pg';
import {promises as fs} from 'node:fs';
import * as path from 'node:path';

// export interface UserTable {
//   id: Generated<number>;
//   email: string;
//   password: string;
//   phoneNumber: string;
//   firstname: string;
//   lastname: string;
//   locale: Generated<string>;
//   createdAt: Generated<Date>;
//   updatedAt: Date | undefined;
//   deletedAt: Date | undefined;
// }

// export type UserWithPassword = Selectable<UserTable>;
// export type NewUser = Insertable<UserTable>;
// export type UserUpdate = Updateable<UserTable>;
// export type IUser = Omit<UserWithPassword, 'password'>;

interface IUser {
  id: number;
  name: string;
}

interface Database {
  user: IUser;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: DB_NAME,
      host: DB_HOST,
      user: DB_USER,
      port: Number(DB_PORT),
      password: DB_PWD,
      max: 10,
    }),
  }),
});

export async function migrateToLatest() {
  const migrationDb = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        database: DB_NAME,
        host: DB_HOST,
        user: DB_USER,
        port: Number(DB_PORT),
        password: DB_PWD,
      }),
    }),
  });

  const migrator = new Migrator({
    db: migrationDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '/migrations'),
    }),
  });

  const {error, results} = await migrator.migrateToLatest();

  results?.forEach(it => {
    if (it.status === 'Success') {
      console.info(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await migrationDb.destroy();
}
