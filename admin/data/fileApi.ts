import { FindParams } from '@strapi/database';
import { z } from 'zod';

import { FileEntity } from '../../server/services/files';
import { FinderFolder } from '../modules/finder';
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

const entityReferenceSchema = z.object({
  id: z.number(),
});

export type EntityReference = z.infer<typeof entityReferenceSchema>;

export const fileApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFiles: build.query<MediaFile[], { params: FindParams<FileEntity> }>({
      query: ({ params = {} }) => {
        return {
          url: `files`,
          params,
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
    getFile: build.query<EntityReference[], { uuid: string; params: FindParams<MediaFile> }>({
      query: ({ uuid, params = {} }) => ({
        url: `files/${uuid}`,
        params,
      }),
      transformResponse: (res: Partial<EntityReference>[]) =>
        res
          .filter((file) => {
            return entityReferenceSchema.safeParse(file).success;
          })
          .map((file) => entityReferenceSchema.parse(file)),
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
    updateFiles: build.mutation<MediaFile[], { uuid: string | string[]; patch: MediaFileUpdate }>({
      query: ({ uuid, patch }) => ({
        url: `files`,
        method: 'PATCH',
        data: {
          action: 'update',
          uuid,
          patch,
        },
      }),
      invalidatesTags: (res) =>
        res
          ? [
              ...res.map<{
                type: 'Files';
                folder: string;
              }>((file) => ({ type: 'Files', folder: file.folderPath })),
              { type: 'Tags' },
            ]
          : [{ type: 'Files', folder: '' }, { type: 'Tags' }],
    }),
  }),
  overrideExisting: false,
});

const { useGetAllFilesQuery, useDeleteFilesMutation, useUpdateFilesMutation, useGetFileQuery } =
  fileApi;

const makeGetAllFilesQuery = (folder?: FinderFolder | null, sortByQuery?: string | null) => ({
  params: {
    populate: {
      folder: true,
      tags: {
        fields: ['uuid'],
      },
    },
    filters: {
      folder: folder?.id ?? null,
    },
    orderBy: sortByQuery
      ? {
          [sortByQuery]: 'asc',
        }
      : {
          createdAt: 'desc',
        },
  },
});

export { useGetAllFilesQuery, useGetFileQuery, makeGetAllFilesQuery };

export const useFileMutationApi = () => {
  const [deleteFile] = useDeleteFilesMutation();
  const [updateFile, { isLoading }] = useUpdateFilesMutation();

  return {
    deleteFile,
    isUpdateFileLoading: isLoading,
    updateFile,
  };
};
