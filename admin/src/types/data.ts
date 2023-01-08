export interface CreateFolderResponse {
  name?: string;
  createdAt?: string;
  id?: number;
  path?: string;
  pathId?: number;
  updatedAt?: string;
}

export type Folder = Omit<CreateFolderResponse, "name" | "id"> &
  Required<Pick<CreateFolderResponse, "name" | "id">> & {
    children?: { count: number };
    files?: { count: number };
  };
