import { UploadItem } from "../modules/upload";
import { strapiAdminApi } from "../store/api";

interface UploadFileData {
  file: File;
  fileInfo: Pick<UploadItem, "assetType" | "hash">;
}

export interface UploadFileResponse {
  alternativeText?: string;
  caption?: string;
  createdAt?: string;
  ext: string;
  // TODO: type this
  folder?: string;
  folderPath: string;
  hash: "7ae793572400cd637013ffaf404f65769d33e1dd";
  height: number;
  id: number;
  mime: string;
  name: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: unknown;
  size: number;
  updatedAt: string;
  url: string;
  width: number;
}

export const uploadApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    uploadFile: build.mutation<UploadFileResponse, UploadFileData>({
      query: ({ file, fileInfo }) => {
        const formData = new FormData();

        formData.append("files", file);

        Object.entries(fileInfo).forEach(([key, val]) => {
          formData.append(key, val as string);
        });

        return {
          url: "files",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            // TODO: update upload progress
            console.log(progressEvent);
          },
        };
      },
    }),
  }),
  overrideExisting: false,
});
