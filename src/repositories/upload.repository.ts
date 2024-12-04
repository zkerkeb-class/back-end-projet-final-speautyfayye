import fs, { ReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import { Extension } from '../models/enums/extension';
import { EFileType } from '../models/enums/fileType';
import LogRepository from './log.repository';
import { EStatusCode } from '../models/enums/statusCode';

export interface IDirectory {
  name: string;
  type: EFileType;
  subFolder: boolean;
}

interface IFile extends IDirectory {
  suffixes?: string[];
  extension: Extension;
}

interface IUpload extends IFile {
  readable: Readable;
}

export default class UploadRepository {
  private readonly directoryPath = 'ressources';

  constructor(private readonly logRepository: LogRepository) {}

  async upload(file: IUpload, directoryPath: string) {
    fs.mkdirSync(directoryPath, { recursive: true });

    file.suffixes?.unshift(file.name);
    const filename = (file.suffixes?.join('-') ?? file.name).concat(
      '.',
      file.extension,
    );
    const writableStream = fs.createWriteStream(
      `${path.join(directoryPath, filename)}`,
    );
    file.readable.pipe(writableStream);
    await new Promise<void>((resolve, reject) => {
      writableStream.on('finish', () => resolve());
      writableStream.on('error', (error) => reject(error));
    });
    this.logRepository.insert(EStatusCode.CREATED, `inserted ${filename}`);
  }

  async uploadMultiple(data: IUpload[], directoryPath: string) {
    await Promise.all(data.map((d) => this.upload(d, directoryPath)));
  }

  read(file: IFile, directoryPath: string): ReadStream {
    file.suffixes?.unshift(file.name);
    const filename = (file.suffixes?.join('-') ?? file.name).concat(
      '.',
      file.extension,
    );
    return fs.createReadStream(`${path.join(directoryPath, filename)}`);
  }

  readPartial(
    file: IFile,
    directoryPath: string,
    start: number,
    end: number,
  ): Readable {
    const filename = file.suffixes?.join('-') ?? file.name;
    return fs.createReadStream(`${path.join(directoryPath, filename)}`, {
      start,
      end,
    });
  }

  readFileStat(file: IFile, directoryPath: string) {
    const filename = file.suffixes?.join('-') ?? file.name;
    return fs.statSync(path.join(directoryPath, filename));
  }

  getDirPath(directory: IDirectory): string {
    return path.join(
      this.directoryPath,
      directory.type,
      directory.subFolder ? directory.name : '',
    );
  }
}
