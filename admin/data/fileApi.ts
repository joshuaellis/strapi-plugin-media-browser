import { z } from 'zod';

import { strapiAdminApi } from '../store/api';

const folderSchema = z.object({
  id: z.number(),
  name: z.string(),
  pathId: z.number(),
  path: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  uuid: z.string(),
});

const fileSchema = z.object({
  uuid: z.string(),
  alternativeText: z.string().optional().nullable(),
  assetType: z.enum(['image', 'file', 'video']),
  caption: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  ext: z.string(),
  folder: folderSchema.nullable().optional(),
  folderPath: z.string(),
  hash: z.string(),
  height: z.number().optional().nullable(),
  id: z.number(),
  mime: z.string(),
  name: z.string(),
  previewUrl: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  provider_metadata: z.null().optional().nullable(),
  tags: z.array(z.object({ uuid: z.string() })),
  size: z.number(),
  updatedAt: z.string().optional().nullable(),
  url: z.string(),
  width: z.number().optional().nullable(),
});

export type MediaFile = z.infer<typeof fileSchema>;

interface MediaFileUpdate extends Omit<Partial<MediaFile>, 'id' | 'tags'> {
  tags: { set: string[] } | { connect: string[]; disconnect: string[] };
}

export const fileApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFilesAtFolder: build.query<MediaFile[], { folder: string; sortBy: string }>({
      query: ({ folder, sortBy }) => {
        return {
          url: `files/${folder}?sort=${sortBy === 'none' ? 'createdAt%3Adesc' : `${sortBy}%3Aasc`}`,
        };
      },
      transformResponse: (res: Partial<MediaFile>[]) =>
        res
          .filter((file) => {
            return fileSchema.safeParse(file).success;
          })
          .map((file) => fileSchema.parse(file)),
      providesTags: (res) =>
        res
          ? res.map((file) => ({ type: 'Files', folder: file.folderPath }))
          : [{ type: 'Files', folder: '' }],
    }),
    deleteFiles: build.mutation<MediaFile[], { uuid: string | string[] }>({
      query: ({ uuid }) => ({
        url: `files`,
        method: 'PATCH',
        data: {
          action: 'delete',
          uuid,
        },
      }),
      invalidatesTags: (res) =>
        res
          ? res.map((file) => ({ type: 'Files', folder: file.folderPath }))
          : [{ type: 'Files', folder: '' }],
    }),
    updateFiles: build.mutation<MediaFile[], { uuid: string | string[]; data: MediaFileUpdate }>(
      {}
    ),
  }),
  overrideExisting: false,
});

const { useGetAllFilesAtFolderQuery, useDeleteFilesMutation } = fileApi;

export { useGetAllFilesAtFolderQuery };

export const useFileMutationApi = () => {
  const [deleteFile] = useDeleteFilesMutation();

  return {
    deleteFile,
  };
};
