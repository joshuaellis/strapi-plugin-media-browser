import { FindParams } from '@strapi/database';
import { Strapi } from '@strapi/strapi';
import { nanoid } from 'nanoid';
import { setCreatorFields } from '@strapi/utils';

import { TAG_MODEL_UID } from '../constants';
import { CreateTagBody } from '../controllers/admin-tag';
import { StrapiUser } from '../types/strapi';

export interface TagEntity {
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
  uuid: string;
}

interface ExtendedFindParams<TEntity> extends Omit<FindParams<TEntity>, 'populate'> {
  populate?: (keyof TEntity)[] | { [Key in keyof TEntity]?: { count: boolean } | boolean };
}

export interface ITagsService {
  findAll(query: ExtendedFindParams<TagEntity>): Promise<Partial<TagEntity>[]>;
  create(data: CreateTagBody, user?: StrapiUser): Promise<Pick<TagEntity, 'name' | 'uuid'>>;
}

class TagsService implements ITagsService {
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  findAll = async (query: ExtendedFindParams<TagEntity>): Promise<Partial<TagEntity>[]> => {
    // @ts-expect-error because the object configuration is missing from TS, we've added it.
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
      select: ['uuid', 'name', 'createdBy'],
      data: enrichedTag,
    });

    return tagEntity;
  };
}

export default ({ strapi }: { strapi: Strapi }): ITagsService => {
  const tagsService = new TagsService(strapi);

  return {
    findAll: tagsService.findAll,
    create: tagsService.create,
  };
};
