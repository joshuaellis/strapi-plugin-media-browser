import { convertTagUUIDsToIDs } from './tags';
import { UpdateFileBody } from '../controllers/admin-file';

export interface UpdateFilePatch extends Omit<UpdateFileBody['patch'], 'tags'> {
  tags?: { set?: number[] } | { connect?: number[]; disconnect?: number[] };
}

export const tranformFilePatch = async (
  patch: UpdateFileBody['patch']
): Promise<UpdateFilePatch> => {
  return {
    ...patch,
    tags: patch.tags ? await convertTagUUIDsToIDs(patch.tags) : undefined,
  };
};
