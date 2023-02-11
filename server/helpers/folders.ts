import { FOLDER_MODEL_UID } from '../constants';
import { IFolderService } from '../services/folder';
import { getService } from './strapi';

export const validateFolderNameIsUnique = (id?: string) => async (name?: string) => {
  try {
    const { checkFolderExists } = getService<IFolderService>('folder');

    const filters: { name?: string; id?: { $ne: string } } = { name };

    if (id) {
      filters.id = { $ne: id };

      if (name === undefined) {
        const existingFolder = await strapi.entityService.findOne(FOLDER_MODEL_UID, id);
        filters.name = existingFolder.name;
      }
    }

    const doesExist = await checkFolderExists(filters);
    return !doesExist;
  } catch (e) {
    console.error('Error trying to check if folder exists', e);
    return false;
  }
};

export const validateFolderExists = async (id: string | number | null) => {
  try {
    if (id === null) return true;
    const { checkFolderExists } = getService<IFolderService>('folder');

    const doesExist = await checkFolderExists({ id });

    return doesExist;
  } catch (e) {
    return false;
  }
};
