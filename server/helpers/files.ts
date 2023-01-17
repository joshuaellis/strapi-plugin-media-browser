import path from "path";
import os from "os";
import fse from "fs-extra";

import { UploadFile } from "../services/files";

export const createAndAssignTmpWorkingDirectoryToFiles = async (
  files: UploadFile
) => {
  const tmpWorkingDirectory = await fse.mkdtemp(
    path.join(os.tmpdir(), "strapi-ml-")
  );

  files.tmpWorkingDirectory = tmpWorkingDirectory;

  return tmpWorkingDirectory;
};

export const bytesToKbytes = (bytes: number) =>
  Math.round((bytes / 1000) * 100) / 100;

export const streamToBuffer = (stream: fse.ReadStream) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk as Buffer);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    stream.on("error", reject);
  });
