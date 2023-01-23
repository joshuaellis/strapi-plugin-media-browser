import { z } from "zod";

import { strapiAdminApi } from "../store/api";

const fileSchema = z.object({
  uuid: z.string(),
  alternativeText: z.string().optional().nullable(),
  assetType: z.enum(["image", "file", "video"]),
  caption: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  ext: z.string(),
  folder: z.null().optional(),
  folderPath: z.string(),
  hash: z.string(),
  height: z.number().optional().nullable(),
  id: z.number(),
  mime: z.string(),
  name: z.string(),
  previewUrl: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  provider_metadata: z.null().optional().nullable(),
  size: z.number(),
  updatedAt: z.string().optional().nullable(),
  url: z.string(),
  width: z.number().optional().nullable(),
});

export type MediaFile = z.infer<typeof fileSchema>;

const fileApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFilesAtFolder: build.query<MediaFile[], string>({
      query: (folder) => ({ url: `files/${folder}` }),
      transformResponse: (res: Partial<MediaFile>[]) =>
        res
          .filter((file) => {
            return fileSchema.safeParse(file).success;
          })
          .map((file) => fileSchema.parse(file)),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllFilesAtFolderQuery } = fileApi;
