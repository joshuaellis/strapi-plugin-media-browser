import { strapiAdminApi } from "../store";

import { CreateFolderBody } from "../../../server/controllers/admin-folder";

import type { CreateFolderResponse, Folder } from "../types/data";

const finderApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFiles: build.query({
      query: () => ({ url: "files" }),
    }),
    postNewFolder: build.mutation<CreateFolderResponse, CreateFolderBody>({
      query: (body) => ({
        url: "folders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Folders"],
    }),
    getAllFolders: build.query<Folder[], undefined>({
      query: () => ({ url: "folders" }),
      transformResponse: (res: Partial<Folder>[]) => {
        const foldersWithNamesAndIds = res.filter(
          (folder) => folder.name && folder.id
        ) as Folder[];

        return foldersWithNamesAndIds;
      },
      providesTags: ["Folders"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllFilesQuery,
  usePostNewFolderMutation,
  useGetAllFoldersQuery,
} = finderApi;
