import path from 'node:path';
import UploadRepository, {IDirectory} from '../repositories/upload.repository';
import {Readable} from 'node:stream';
import {EAudioExtension} from '../models/enums/extension';
import {EFileType} from '../models/enums/fileType';
import {ReadStream} from 'node:fs';
import ConvertService from './convert.service';
import FileRepository from '../repositories/file.repository';

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

  read(name: string): ReadStream {
    const directory: IDirectory = {
      name,
      subFolder: false,
      type: EFileType.AUDIO,
    };
    return this.uploadRepository.read(
      {
        ...directory,
        extension: EAudioExtension.MP3,
      },
      this.uploadRepository.getDirPath(directory)
    );
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
        end
      ),
      chunkSize,
      start,
      end,
      fileSize: stats.size,
    };
  }
}
