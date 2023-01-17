import { strapiAdminApi } from "../store/api";

import { CreateFolderBody } from "../../../server/controllers/admin-folder";

import type { CreateFolderResponse, Folder } from "../types/data";

const finderApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFiles: build.query({
      query: () => ({ url: "files" }),
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
  useGetAllFilesQuery,
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
