import sharp, {FormatEnum} from 'sharp';
import {EImageExtension} from '../models/enums/extension';
import {Readable} from 'node:stream';

interface IConvertImageInput {
  buffer: Buffer;
  size: number;
  to: EImageExtension;
}

interface IConvertAudioInput {
  buffer: Buffer;
}

export interface IConvertAudioOutput {
  audio: Readable;
}

export interface IConvertImageOutput {
  image: Readable;
  size: number;
  extension: EImageExtension;
}

export default class ConvertService {
  private readonly quality = 80;

  convertImage(data: IConvertImageInput): IConvertImageOutput {
    return {
      image: sharp(data.buffer)
        .resize(data.size, data.size, {
          fit: 'inside',
        })
        .toFormat(data.to as string as keyof FormatEnum, {
          quality: this.quality,
        }),
      size: data.size,
      extension: data.to,
    };
  }

  // convertAudio(data: IConvertAudioInput) {
  //   const outputStream = new PassThrough();
  //   return ffmpeg()
  //     .input(data.buffer.toString())
  //     .inputFormat('mp3')
  //     .toFormat('aac')
  //     .pipe(outputStream);
  // }
}
