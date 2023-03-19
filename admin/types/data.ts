export interface CreateFolderResponse {
  name?: string;
  createdAt?: string;
  id?: number;
  path?: string;
  pathId?: number;
  updatedAt?: string;
}

export type Folder = Omit<CreateFolderResponse, 'name' | 'id' | 'path'> &
  Required<Pick<CreateFolderResponse, 'name' | 'id' | 'path'>> & {
    children?: { count: number };
    files?: { count: number };
  };
