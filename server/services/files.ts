import { Strapi } from "@strapi/strapi";
import fse from "fs-extra";
import path from "path";
import { extension } from "mime-types";
import { nanoid } from "nanoid";

import {
  CREATED_BY_ATTRIBUTE,
  FILE_MODEL_UID,
  FOLDER_MODEL_UID,
  UPDATED_BY_ATTRIBUTE,
} from "../constants";

import { UploadFileBody } from "../controllers/admin-file";

import {
  bytesToKbytes,
  createAndAssignTmpWorkingDirectoryToFiles,
} from "../helpers/files";
import { getService } from "../helpers/strapi";

export interface UploadFile {
  readonly size: number;
  readonly type: string;
  readonly name: string;
  tmpWorkingDirectory: string;
  path: string;
}

export interface FileEntity {
  uuid: string;
  assetType: "image" | "file" | "video";
  name: string;
  // TODO: Add setting a folder & folderPath
  folder: null;
  folderPath: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  tmpWorkingDirectory?: string;
  getStream?: () => fse.ReadStream;
  width?: string;
  height?: string;
  provider?: string;
}

interface FormatFileInfoMeta {
  tmpWorkingDirectory?: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  findPage(query) {
    return strapi.entityService.findMany(FILE_MODEL_UID, query);
  },
  async upload(
    { data, files }: { data: UploadFileBody; files: UploadFile },
    // TODO: Type this
    user?: any
  ) {
    // create temporary folder to store files for stream manipulation
    const tmpWorkingDirectory = await createAndAssignTmpWorkingDirectoryToFiles(
      files
    );

    let uploadedFile;

    const { enhanceFile, uploadFileAndPersist } = getService("files");

    try {
      const { hash, assetType } = data;

      const fileData: FileEntity = await enhanceFile(files, {
        hash,
        assetType,
      });

      uploadedFile = await uploadFileAndPersist(fileData, user);
    } finally {
      // delete temporary folder
      console.log("deleting temp folder");
      await fse.remove(tmpWorkingDirectory);
    }

    return uploadedFile;
  },
  async enhanceFile(
    file: UploadFile,
    fileInfo: UploadFileBody
  ): Promise<FileEntity> {
    const currentFile: FileEntity = await getService("files").formatFileInfo(
      file,
      fileInfo,
      {
        tmpWorkingDirectory: file.tmpWorkingDirectory,
      }
    );

    console.log(file.path);

    currentFile.getStream = () => fse.createReadStream(file.path);

    return currentFile;
  },
  async getFolderPath(folderId?: string) {
    if (!folderId) return "/";

    const parentFolder = await strapi.entityService.findOne(
      FOLDER_MODEL_UID,
      folderId
    );

    return parentFolder.path;
  },
  async formatFileInfo(
    file: UploadFile,
    fileInfo: UploadFileBody,
    meta: FormatFileInfoMeta = {}
  ) {
    let ext = path.extname(file.name);
    if (!ext) {
      ext = `.${extension(file.type)}`;
    }
    const usedName = file.name.normalize();

    const entity: FileEntity = {
      uuid: nanoid(),
      assetType: fileInfo.assetType,
      name: usedName,
      // TODO: Add setting a folder & folderPath
      folder: null,
      folderPath: await getService("files").getFolderPath(null),
      hash: fileInfo.hash,
      ext,
      mime: file.type,
      size: bytesToKbytes(file.size),
    };

    if (meta.tmpWorkingDirectory) {
      entity.tmpWorkingDirectory = meta.tmpWorkingDirectory;
    }

    return entity;
  },
  async uploadFileAndPersist(
    file: FileEntity,
    // TODO: Type this
    user?: any
  ) {
    const config = strapi.config.get("plugin.upload");

    let dataForEntityCreation: FileEntity = {
      ...file,
      provider: config.provider,
    };

    if (file.assetType === "image") {
      const imageWithDimensions = await getService("images").uploadImage(file);

      dataForEntityCreation = {
        ...dataForEntityCreation,
        ...imageWithDimensions,
      };
    } else {
      const uploadedFile = await getService("provider").upload(file);

      dataForEntityCreation = {
        ...dataForEntityCreation,
        ...uploadedFile,
      };
    }

    // Persist file(s)
    return getService("files").add(dataForEntityCreation, user);
  },

  async add(values: FileEntity, user?: any) {
    const fileValues = { ...values };
    if (user) {
      fileValues[UPDATED_BY_ATTRIBUTE] = user.id;
      fileValues[CREATED_BY_ATTRIBUTE] = user.id;
    }

    const res = await strapi.query(FILE_MODEL_UID).create({ data: fileValues });

    return res;
  },
});
