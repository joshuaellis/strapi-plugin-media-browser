import { Strapi } from '@strapi/strapi';
import { NotFoundError, ForbiddenError } from '@strapi/utils/lib/errors';

import { getService } from './strapi';
import { CREATED_BY_ATTRIBUTE } from '../constants';
import { IFilesService } from '../services/files';

interface FindEntityAndCheckPermissionsArgs {
  ability: any;
  action: string;
  model: string;
}

export const findEntityAndCheckPermissions =
  (strapi: Strapi) =>
  async (uuid: string, { ability, action, model }: FindEntityAndCheckPermissionsArgs) => {
    const file = await getService<IFilesService>('files').findOne(uuid, {
      select: [CREATED_BY_ATTRIBUTE, 'folder', 'id'],
    });

    if (!file) {
      throw new NotFoundError();
    }

    // @ts-ignore it does exist thx
    const pm = strapi.admin.services.permission.createPermissionsManager({
      ability,
      action,
      model,
    });

    const creatorId = file?.[CREATED_BY_ATTRIBUTE]?.id;

    const author = creatorId
      ? // @ts-ignore it does exist thx
        await strapi.admin.services.user.findOne(creatorId, ['roles'])
      : null;

    const fileWithRoles = { ...file, [CREATED_BY_ATTRIBUTE]: author };

    if (pm.ability.cannot(pm.action, pm.toSubject(fileWithRoles))) {
      throw new ForbiddenError();
    }

    return { pm, file };
  };
