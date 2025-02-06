import ffmpeg from 'fluent-ffmpeg';
import {PassThrough, Readable} from 'node:stream';
import sharp, {FormatEnum} from 'sharp';
import {EImageExtension} from '../models/enums/extension';

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

  async convertToWav(audioBuffer: Buffer): Promise<Readable> {
    return new Promise<Readable>((resolve, reject) => {
      const bufferStream = new Readable();
      bufferStream.push(audioBuffer);
      bufferStream.push(null);

      const wavStream = new PassThrough();

      ffmpeg(bufferStream)
        .inputFormat('mp3')
        .toFormat('wav')
        .on('error', err => {
          reject(err);
        })
        .on('end', () => {})
        .pipe(wavStream);

      resolve(wavStream);
    });
  }
}
