import {ReadStream} from 'node:fs';
import {EImageExtension, Extension} from '../models/enums/extension';
import {EFileType} from '../models/enums/fileType';
import FileRepository from '../repositories/file.repository';
import UploadRepository, {IDirectory} from '../repositories/upload.repository';
import ConvertService, {IConvertImageOutput} from './convert.service';

export default class ImageService {
  private readonly sizes = [200, 400, 800];

  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly fileRepository: FileRepository,
    private readonly convertService: ConvertService
  ) {}

  upload = async (image: Express.Multer.File) => {
    const uuid = crypto.randomUUID();
    const convertedImages: IConvertImageOutput[][] = this.sizes.map(size =>
      Object.values(EImageExtension).map((key: string) =>
        this.convertService.convertImage({
          buffer: image.buffer,
          size,
          to: key as EImageExtension,
        })
      )
    );

    const directory: IDirectory = {
      name: uuid,
      type: EFileType.IMAGE,
      subFolder: true,
    };
    await this.uploadRepository.uploadMultiple(
      convertedImages.flatMap(convertedSizedImages =>
        convertedSizedImages.map(extension => ({
          ...directory,
          suffixes: [extension.size.toString()],
          extension: extension.extension,
          readable: extension.image,
        }))
      ),
      this.uploadRepository.getDirPath(directory)
    );
    await this.fileRepository.insert({
      id: uuid,
      fileType: EFileType.IMAGE,
    });
    return uuid;
  };

  read(name: string, size: string, extension: Extension): ReadStream {
    const directory: IDirectory = {
      name: name,
      type: EFileType.IMAGE,
      subFolder: true,
    };
    const result = this.uploadRepository.read(
      {
        ...directory,
        suffixes: [size],
        extension,
      },
      this.uploadRepository.getDirPath(directory)
    );
    return result;
  }
}
