import { z } from "zod";

import { strapiAdminApi } from "../store/api";

import { CreateFolderBody } from "../../../server/controllers/admin-folder";

import type { CreateFolderResponse, Folder } from "../types/data";

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

const finderApi = strapiAdminApi.injectEndpoints({
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
    getAllFolders: build.query<Folder[], undefined>({
      query: () => ({ url: "folders" }),
      transformResponse: (res: Partial<Folder>[]) => {
        const foldersWithNamesAndIds = res.filter(
          (folder) => folder.name && folder.id && folder.path
        ) as Folder[];

        return foldersWithNamesAndIds;
      },
      providesTags: ["Folders"],
    }),
    postNewFolder: build.mutation<CreateFolderResponse, CreateFolderBody>({
      query: (body) => ({
        url: "folders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Folders"],
    }),
    // TODO: type this return type?
    deleteFolder: build.mutation<unknown, string>({
      query: (id) => ({
        url: `folders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Folders"],
    }),
    // TODO: type this return type?
    updateFolder: build.mutation<
      unknown,
      { id: string; patch?: Partial<Folder> }
    >({
      query: ({ id, patch = {} }) => ({
        url: "folders",
        method: "PUT",
        body: {
          id,
          patch,
        },
      }),
      invalidatesTags: ["Folders"],
    }),
  }),
  overrideExisting: false,
});

export const useGetAllFilesQueryState =
  finderApi.endpoints.getAllFolders.useQueryState;

export const {
  useGetAllFilesAtFolderQuery,
  usePostNewFolderMutation,
  useGetAllFoldersQuery,
  useDeleteFolderMutation,
  useUpdateFolderMutation,
} = finderApi;

export const useFolderMutationApi = () => {
  const [postNewFolder] = usePostNewFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();

  return {
    postNewFolder,
    deleteFolder,
    updateFolder,
  };
};
