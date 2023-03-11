import { errors } from '@strapi/utils';


import type { FileEntity } from './files';
import type { IProviderService } from './provider';
import { getService } from '../helpers/strapi';
import { streamToBuffer } from '../helpers/streaming';

const { ApplicationError } = errors;

export interface IImagesService {
  upload: (fileData: FileEntity) => Promise<FileEntity>;
}

class ImageService implements IImagesService {
  upload = async (fileData: FileEntity): Promise<FileEntity> => {
    // Store width and height of the original image
    const { width, height } = await this.getDimensions(fileData);

    // Make sure this is assigned before calling any upload
    // That way it can mutate the width and height
    const fileDataWithDimensions = {
      ...fileData,
      width,
      height,
    };

    // Wait for all uploads to finish
    const uploadedImage = await getService<IProviderService>('provider').upload(
      fileDataWithDimensions
    );

    return { ...fileDataWithDimensions, ...uploadedImage };
  };

  private getDimensions = async (file: FileEntity): Promise<{ width: number; height: number }> => {
    if (!file.getStream) {
      throw new ApplicationError('File stream is not available');
    }

    const buffer = await streamToBuffer(file.getStream());

    return {
      height: Math.abs(buffer.readInt32LE(22)),
      width: buffer.readUInt32LE(18),
    };
  };
}

export default (): IImagesService => {
  const service = new ImageService();

  return {
    upload: service.upload,
  };
};
