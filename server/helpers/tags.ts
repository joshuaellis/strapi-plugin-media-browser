import { getService } from './strapi';
import type { ITagsService } from '../services/tags';

export const validateTagNameIsUnique = async (name: string): Promise<boolean> => {
  const { findAll } = getService<ITagsService>('tags');

  try {
    const tagsWithName = await findAll({
      where: { name },
    });

    if (tagsWithName.length > 0) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error trying to check if tag name is unique', err);
    return false;
  }
};
