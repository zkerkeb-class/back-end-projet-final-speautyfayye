import path from 'node:path';
import { EImageExtension, Extension } from '../models/enums/extension';
import { EFileType } from '../models/enums/fileType';
import UploadRepository, {
  IDirectory,
} from '../repositories/upload.repository';
import ConvertService, { IConvertImageOutput } from './convert.service';
import { ReadStream } from 'node:fs';

export default class ImageService {
  private readonly sizes = [200, 400, 800];

  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly convertService: ConvertService,
  ) {}

  upload = async (image: Express.Multer.File) => {
    const convertedImages: IConvertImageOutput[][] = this.sizes.map((size) =>
      Object.values(EImageExtension).map((key: string) =>
        this.convertService.convertImage({
          buffer: image.buffer,
          size,
          to: key as EImageExtension,
        }),
      ),
    );

    const name = path.parse(image.originalname).name;
    const directory: IDirectory = {
      name,
      type: EFileType.IMAGE,
      subFolder: true,
    };
    await this.uploadRepository.uploadMultiple(
      convertedImages.flatMap((convertedSizedImages) =>
        convertedSizedImages.map((extension) => ({
          ...directory,
          suffixes: [extension.size.toString()],
          extension: extension.extension,
          readable: extension.image,
        })),
      ),
      this.uploadRepository.getDirPath(directory),
    );
  };

  read(name: string, size: string, extension: Extension): ReadStream {
    const directory: IDirectory = {
      name: name,
      type: EFileType.IMAGE,
      subFolder: true,
    };
    return this.uploadRepository.read(
      {
        ...directory,
        suffixes: [size],
        extension,
      },
      this.uploadRepository.getDirPath(directory),
    );
  }
}
