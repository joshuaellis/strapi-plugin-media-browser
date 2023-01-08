import { getService } from "./strapi";

export const validateFolderNameIsUnique = async (name: string) => {
  try {
    const { checkFolderExists } = getService("folder");
    const doesExist = await checkFolderExists({ name });
    return !doesExist;
  } catch (e) {
    return false;
  }
};

export const validateFolderExists = async (id: string | number | null) => {
  try {
    if (id === null) return true;
    const { checkFolderExists } = getService("folder");

    const doesExist = await checkFolderExists({ id });

    return doesExist;
  } catch (e) {
    return false;
  }
};
