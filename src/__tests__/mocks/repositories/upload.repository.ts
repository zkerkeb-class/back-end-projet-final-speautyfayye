import UploadRepository from '../../../repositories/upload.repository';

export const mockUploadRepository = () => {
  jest
    .spyOn(UploadRepository.prototype, 'getDirPath')
    .mockImplementation(() => undefined as any);

  jest
    .spyOn(UploadRepository.prototype, 'read')
    .mockImplementation(() => undefined as any);

  jest
    .spyOn(UploadRepository.prototype, 'readFileStat')
    .mockImplementation(() => undefined as any);

  jest
    .spyOn(UploadRepository.prototype, 'readPartial')
    .mockImplementation(() => undefined as any);

  jest
    .spyOn(UploadRepository.prototype, 'upload')
    .mockImplementation(() => undefined as any);

  jest
    .spyOn(UploadRepository.prototype, 'uploadMultiple')
    .mockImplementation(() => undefined as any);
};
