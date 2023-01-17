import { errors } from "@strapi/utils";

import { streamToBuffer } from "../helpers/files";
import { getService } from "../helpers/strapi";

import { FileEntity } from "./files";

const { ApplicationError } = errors;

const uploadImage = async (fileData: FileEntity) => {
  // Store width and height of the original image
  const { width, height } = await getDimensions(fileData);

  // Make sure this is assigned before calling any upload
  // That way it can mutate the width and height
  const fileDataWithDimensions = {
    ...fileData,
    width,
    height,
  };

  // Wait for all uploads to finish
  const uploadedImage = await getService("provider").upload(
    fileDataWithDimensions
  );

  return { ...fileDataWithDimensions, ...uploadedImage };
};

const getDimensions = async (file: FileEntity) => {
  if (!file.getStream) {
    throw new ApplicationError("File stream is not available");
  }

  const buffer = await streamToBuffer(file.getStream());

  return {
    height: Math.abs(buffer.readInt32LE(22)),
    width: buffer.readUInt32LE(18),
  };
};

export default () => ({
  uploadImage,
});
