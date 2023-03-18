import type { Strapi } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import type { ReadStream } from 'fs-extra';
import { isFunction } from 'lodash';

import type { FileEntity } from './files';
import { PLUGIN_NAME } from '../constants';
import { streamToBuffer } from '../helpers/streaming';

const { ApplicationError } = errors;

export interface ProviderUploadFile extends FileEntity {
  stream?: ReadStream;
  buffer?: Buffer;
  url?: string;
}

/**
 * Interacts
 */
export interface IProviderService {
  /**
   * Upload a file via the configured provider.
   */
  upload: (file: FileEntity) => Promise<ProviderUploadFile>;
  delete: (file: FileEntity) => Promise<void>;
}

class ProviderService implements IProviderService {
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  upload = async (file: FileEntity): Promise<ProviderUploadFile> => {
    if (!file.getStream) {
      throw new ApplicationError('File stream is not available');
    }

    const uploadFile: ProviderUploadFile = {
      ...file,
    };

    const { uploadStream, upload } = this.strapi.plugin(PLUGIN_NAME).provider;

    if (isFunction(uploadStream)) {
      uploadFile.stream = file.getStream();
      await uploadStream(uploadFile);
      delete uploadFile.stream;
    } else {
      uploadFile.buffer = await streamToBuffer(file.getStream());
      await upload(uploadFile);
      delete uploadFile.buffer;
    }

    /**
     * YOU MUST USE THIS RETURNED FILE
     * Because the provider mutates the file adding a URL.
     */
    return uploadFile;
  };

  delete = async (file: FileEntity): Promise<void> => {
    const { delete: deleteFile } = this.strapi.plugin(PLUGIN_NAME).provider;

    if (isFunction(deleteFile)) {
      await deleteFile(file);
    }
  };
}

export default ({ strapi }: { strapi: Strapi }): IProviderService => {
  const service = new ProviderService(strapi);

  return {
    upload: service.upload,
    delete: service.delete,
  };
};
