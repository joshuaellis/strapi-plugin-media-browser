import { Strapi } from '@strapi/strapi';
import fse from 'fs-extra';
import path from 'path';
import os from 'os';
import { extension } from 'mime-types';
import { nanoid } from 'nanoid';

import {
  CREATED_BY_ATTRIBUTE,
  FILE_MODEL_UID,
  PLUGIN_NAME,
  UPDATED_BY_ATTRIBUTE,
} from '../constants';

import { UploadFileBody } from '../controllers/admin-file';

import { getService } from '../helpers/strapi';
import { StrapiUser } from '../types/strapi';
import { IImagesService } from './images';
import { IFolderService } from './folder';
import { IProviderService } from './provider';

export interface UploadFile {
  readonly size: number;
  readonly type: string;
  readonly name: string;
  path: string;
}

export interface FileEntity {
  uuid: string;
  assetType: 'image' | 'file' | 'video';
  name: string;
  // TODO: Add setting a folder & folderPath
  folder: number | null;
  folderPath: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  tmpWorkingDirectory?: string;
  getStream?: () => fse.ReadStream;
  width?: number;
  height?: number;
  provider?: string;
}

export interface IFilesService {
  /**
   * upload a file with it's additional metadata
   */
  upload: (
    { data, file }: { data: UploadFileBody; file: UploadFile },
    user?: StrapiUser
  ) => Promise<FileEntity | undefined>;
  /**
   * Delete a file based on it's UUID
   */
  deleteFile: (uuid: string) => Promise<FileEntity | undefined>;
  /**
   * Find many files based on a query or omit the query
   * to find all files in the DB.
   */
  findAll: (query?: any) => Promise<FileEntity[]>;
}
class FilesService implements IFilesService {
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  /**
   * Upload handling
   */
  upload = async (
    { data, file }: { data: UploadFileBody; file: UploadFile },
    user?: StrapiUser
  ): Promise<FileEntity | undefined> => {
    // create temporary folder to store files for stream manipulation
    const tmpWorkingDirectory = await fse.mkdtemp(path.join(os.tmpdir(), 'strapi-ml-'));

    let uploadedFile: FileEntity | undefined = undefined;

    try {
      const { hash, assetType, folder } = data;

      const fileData: FileEntity = await this.enhanceFile(file, {
        hash,
        assetType,
        tmpWorkingDirectory,
        folder,
      });

      uploadedFile = await this.uploadFileAndPersist(fileData, user);
    } finally {
      // delete temporary folder
      await fse.remove(tmpWorkingDirectory);
    }

    return uploadedFile;
  };

  private enhanceFile = async (
    file: UploadFile,
    fileInfo: UploadFileBody & { tmpWorkingDirectory: string }
  ): Promise<FileEntity> => {
    let ext = path.extname(file.name);

    if (!ext) {
      ext = `.${extension(file.type)}`;
    }

    const usedName = file.name.normalize();

    const { getPath, getFolderByName } = getService<IFolderService>('folder');

    const { id: folderId } = (await getFolderByName(fileInfo.folder)) ?? {};

    const entity: FileEntity = {
      uuid: nanoid(),
      assetType: fileInfo.assetType,
      name: usedName,
      // TODO: Add setting a folder & folderPath
      folder: folderId ? folderId : null,
      folderPath: await getPath(folderId),
      hash: fileInfo.hash,
      ext,
      mime: file.type,
      size: Math.round((file.size / 1000) * 100) / 100,
      tmpWorkingDirectory: fileInfo.tmpWorkingDirectory,
    };

    entity.getStream = () => fse.createReadStream(file.path);

    return entity;
  };

  private uploadFileAndPersist = async (
    file: FileEntity,
    // TODO: Type this
    user?: any
  ) => {
    const config = this.strapi.config.get(`plugin.${PLUGIN_NAME}`);

    let dataForEntityCreation: FileEntity = {
      ...file,
      provider: config.provider,
    };

    if (file.assetType === 'image') {
      const imageWithDimensions = await getService<IImagesService>('images').upload(file);

      dataForEntityCreation = {
        ...dataForEntityCreation,
        ...imageWithDimensions,
      };
    } else {
      const uploadedFile = await getService<IProviderService>('provider').upload(file);

      dataForEntityCreation = {
        ...dataForEntityCreation,
        ...uploadedFile,
      };
    }

    if (user) {
      dataForEntityCreation[UPDATED_BY_ATTRIBUTE] = user.id;
      dataForEntityCreation[CREATED_BY_ATTRIBUTE] = user.id;
    }

    const res = await this.strapi.query(FILE_MODEL_UID).create({ data: dataForEntityCreation });

    return res;
  };
  /**
   * Manipulations
   */
  deleteFile = async (uuid: string): Promise<FileEntity | undefined> => {
    /**
     * TODO: You shouldn't be able to delete a file when it's used in an actual entity.
     */

    const [file] = await this.strapi.entityService.findMany(FILE_MODEL_UID, {
      fields: ['id', 'hash', 'ext'],
      filters: {
        uuid,
      },
    });

    const { id: fileID } = file;

    if (!fileID) {
      return undefined;
    }

    const { delete: deleteFile } = getService<IProviderService>('provider');

    await deleteFile(file);

    const deletedFile = await this.strapi.entityService.delete(FILE_MODEL_UID, fileID);

    return deletedFile;
  };

  /**
   * Fetching
   */
  findAll = async (query: unknown) => {
    return await this.strapi.entityService.findMany(FILE_MODEL_UID, query);
  };
}

export default ({ strapi }: { strapi: Strapi }): IFilesService => {
  const service = new FilesService(strapi);

  return {
    upload: service.upload,
    findAll: service.findAll,
    deleteFile: service.deleteFile,
  };
};
