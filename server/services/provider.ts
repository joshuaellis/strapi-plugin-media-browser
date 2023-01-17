import type { Strapi } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import type { ReadStream } from "fs-extra";
import { isFunction } from "lodash";

import { streamToBuffer } from "../helpers/files";

import { FileEntity } from "./files";

const { ApplicationError } = errors;

export interface ProviderUploadFile extends FileEntity {
  stream?: ReadStream;
  buffer?: Buffer;
  url?: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  async upload(file: FileEntity) {
    if (!file.getStream) {
      throw new ApplicationError("File stream is not available");
    }

    const uploadFile: ProviderUploadFile = {
      ...file,
    };

    if (isFunction(strapi.plugin("upload").provider.uploadStream)) {
      uploadFile.stream = file.getStream();
      await strapi.plugin("upload").provider.uploadStream(uploadFile);
      delete uploadFile.stream;
    } else {
      uploadFile.buffer = await streamToBuffer(file.getStream());
      await strapi.plugin("upload").provider.upload(uploadFile);
      delete uploadFile.buffer;
    }

    /**
     * YOU MUST USE THIS RETURNED FILE
     * Because the provider mutates the file adding a URL.
     */
    return uploadFile;
  },
});
