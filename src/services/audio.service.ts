import {Readable} from 'node:stream';
import {EAudioExtension} from '../models/enums/extension';
import {EFileType} from '../models/enums/fileType';
import {EStatusCode} from '../models/enums/statusCode';
import {Error} from '../models/error';
import FileRepository from '../repositories/file.repository';
import UploadRepository, {IDirectory} from '../repositories/upload.repository';
import ConvertService from './convert.service';

export default class AudioService {
  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly fileRepository: FileRepository,
    private readonly convertService: ConvertService
  ) {}

  async upload(audio: Express.Multer.File) {
    const uuid = crypto.randomUUID();
    const directory: IDirectory = {
      name: uuid,
      subFolder: false,
      type: EFileType.AUDIO,
    };

    // this.convertService.convertAudio({ buffer: audio.buffer });
    this.uploadRepository.upload(
      {
        ...directory,
        readable: Readable.from(audio.buffer),
        extension: EAudioExtension.MP3,
      },
      this.uploadRepository.getDirPath(directory)
    );
    await this.fileRepository.insert({
      id: uuid,
      fileType: EFileType.AUDIO,
    });
    return uuid;
  }

  read(name: string): {
    readable: Readable;
  } {
    const directory: IDirectory = {
      name,
      subFolder: false,
      type: EFileType.AUDIO,
    };

    const readable = this.uploadRepository.read(
      {
        ...directory,
        extension: EAudioExtension.MP3,
      },
      this.uploadRepository.getDirPath(directory)
    );

    if (!readable) {
      throw new Error(EStatusCode.NOT_FOUND, {
        logLevel: 'warn',
        message: `File ${name} not found`,
      });
    }

    return {
      readable,
    };
  }

  readPartial(
    name: string,
    range: string
  ): {
    readable: Readable;
    chunkSize: number;
    start: number;
    end: number;
    fileSize: number;
  } {
    const directory: IDirectory = {
      name,
      subFolder: false,
      type: EFileType.AUDIO,
    };
    const stats = this.uploadRepository.readFileStat(
      {
        ...directory,
        extension: EAudioExtension.MP3,
      },
      this.uploadRepository.getDirPath(directory)
    );

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunkSize = end - start + 1;

    return {
      readable: this.uploadRepository.readPartial(
        {
          ...directory,
          extension: EAudioExtension.MP3,
        },
        this.uploadRepository.getDirPath(directory),
        start,
        stats.size
      ),
      chunkSize,
      start,
      end,
      fileSize: stats.size,
    };
  }
}
