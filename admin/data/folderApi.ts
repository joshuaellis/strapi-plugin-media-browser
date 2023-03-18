import type { CreateFolderBody } from '../../server/controllers/admin-folder';
import { strapiAdminApi } from '../store/api';
import type { CreateFolderResponse, Folder } from '../types/data';

const folderApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFolders: build.query<Folder[], undefined>({
      query: () => ({ url: 'folders' }),
      transformResponse: (res: Partial<Folder>[]) => {
        const foldersWithNamesAndIds = res.filter(
          (folder) => folder.name && folder.id && folder.path
        ) as Folder[];

        return foldersWithNamesAndIds;
      },
      providesTags: ['Folders'],
    }),
    postNewFolder: build.mutation<CreateFolderResponse, CreateFolderBody>({
      query: (body) => ({
        url: 'folders',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Folders'],
    }),
    // TODO: type this return type?
    deleteFolder: build.mutation<unknown, string>({
      query: (id) => ({
        url: `folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folders'],
    }),
    // TODO: type this return type?
    updateFolder: build.mutation<unknown, { id: string; patch?: Partial<Folder> }>({
      query: ({ id, patch = {} }) => ({
        url: 'folders',
        method: 'PUT',
        data: {
          id,
          patch,
        },
      }),
      invalidatesTags: ['Folders'],
    }),
  }),
  overrideExisting: false,
});

export const useGetAllFoldersQueryState = folderApi.endpoints.getAllFolders.useQueryState;

export const {
  usePostNewFolderMutation,
  useGetAllFoldersQuery,
  useDeleteFolderMutation,
  useUpdateFolderMutation,
} = folderApi;

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
