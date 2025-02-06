import {db} from '../config/db/db';
import {IFile, NewFile} from '../models/file';

export default class FileRepository {
  insert = async (file: NewFile): Promise<IFile> => {
    return await db
      .insertInto('file')
      .values(file)
      .returningAll()
      .executeTakeFirstOrThrow();
  };
}
