import type { FindParams } from '@strapi/database';
import type { Strapi } from '@strapi/strapi';
import { setCreatorFields } from '@strapi/utils';
import { nanoid } from 'nanoid';

import { TAG_MODEL_UID } from '../constants';
import type { CreateTagBody } from '../controllers/admin-tag';
import type { StrapiUser } from '../types/strapi';

export interface TagEntity {
  readonly id: number;
  createdAt: string;
  createdBy: {
    firstname: string;
    lastname: string;
  };
  files: {
    count: number;
  };
  name: string;
  updatedAt: string;
  readonly uuid: string;
}

export interface TagEntityPatch extends Omit<TagEntity, 'files' | 'uuid'> {
  files: {
    connect: string[];
    disconnect: string[];
  };
}

/**
 * Updated could be that it has been deleted.
 */
type UpdatedTag = Pick<TagEntity, 'name' | 'uuid'>;

export interface ITagsService {
  findAll(query: FindParams<TagEntity>): Promise<Partial<TagEntity>[]>;
  create(data: CreateTagBody, user?: StrapiUser): Promise<UpdatedTag>;
  delete(uuids: string[]): Promise<{ totalTagNumber: number; tags: UpdatedTag[] }>;
  update(uuid: string, patch: TagEntityPatch): Promise<UpdatedTag | undefined>;
}

class TagsService implements ITagsService {
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  findAll = async (query: FindParams<TagEntity>): Promise<Partial<TagEntity>[]> => {
    return this.strapi.db.query(TAG_MODEL_UID).findMany(query);
  };

  create = async (
    data: CreateTagBody,
    user?: StrapiUser
  ): Promise<Pick<TagEntity, 'name' | 'uuid'>> => {
    let enrichedTag = {
      ...data,
      uuid: nanoid(),
    };

    if (user) {
      enrichedTag = await setCreatorFields({ user })(enrichedTag);
    }

    const tagEntity = await this.strapi.db.entityManager.create(TAG_MODEL_UID, {
      select: ['uuid', 'name'],
      populate: {
        createdBy: true,
        files: {
          count: true,
        },
      },
      data: enrichedTag,
    });

    return tagEntity;
  };

  delete = async (uuids: string[]): Promise<{ totalTagNumber: number; tags: UpdatedTag[] }> => {
    const tags = (await this.strapi.db
      .query(TAG_MODEL_UID)
      .findMany({ select: ['name', 'uuid'], where: { uuid: { $in: uuids } } })) as UpdatedTag[];

    if (tags.length === 0) {
      return {
        tags: [],
        totalTagNumber: 0,
      };
    }

    const { count: totalTagNumber } = await this.strapi.db.query(TAG_MODEL_UID).deleteMany({
      where: {
        $or: tags.map((tag) => ({ uuid: tag.uuid })),
      },
    });

    return {
      tags,
      totalTagNumber,
    };
  };

  update = async (uuid: string, patch: TagEntityPatch): Promise<UpdatedTag | undefined> => {
    const tag = await this.strapi.db.query(TAG_MODEL_UID).findOne({
      where: {
        uuid,
      },
    });

    if (!tag) {
      return undefined;
    }

    const updatedTag = await this.strapi.db.query(TAG_MODEL_UID).update({
      select: ['uuid', 'name'],
      where: {
        uuid,
      },
      data: patch,
    });

    return updatedTag;
  };
}

export default ({ strapi }: { strapi: Strapi }): ITagsService => {
  const tagsService = new TagsService(strapi);

  return {
    findAll: tagsService.findAll,
    create: tagsService.create,
    delete: tagsService.delete,
    update: tagsService.update,
  };
};
