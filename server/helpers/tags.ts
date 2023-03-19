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

export const convertTagUUIDsToIDs = async (
  tags: { set?: string[] } | { connect?: string[]; disconnect?: string[] }
): Promise<{ set: number[] } | { connect: number[]; disconnect: number[] } | undefined> => {
  const { findAll } = getService<ITagsService>('tags');

  try {
    if ('set' in tags) {
      const tagIds = await findAll({
        select: ['id'],
        where: {
          uuid: tags.set,
        },
      });

      return { set: tagIds.map((tag) => tag.id!) };
    } else if ('connect' in tags || 'disconnect' in tags) {
      const connectTags = tags?.connect
        ? await findAll({
            select: ['id'],
            where: {
              uuid: {
                $in: tags.connect,
              },
            },
          })
        : [];

      const disconnectTags = tags?.disconnect
        ? await findAll({
            select: ['id'],
            where: {
              uuid: {
                $in: tags.disconnect,
              },
            },
          })
        : [];

      return {
        connect: connectTags.map((tag) => tag.id!),
        disconnect: disconnectTags.map((tag) => tag.id!),
      };
    }
  } catch (err) {
    console.error('Error trying to convert tag UUIDs to IDs', err);
    return undefined;
  }
};
