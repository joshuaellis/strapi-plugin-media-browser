import type { GenericController } from '@strapi/strapi/lib/core-api/controller';
import { z } from 'zod';

import { ACTIONS, TAG_MODEL_UID } from '../constants';
import { NO_SLASH_REGEX } from '../helpers/regex';
import { getService } from '../helpers/strapi';
import { validateTagNameIsUnique } from '../helpers/tags';
import type { ITagsService } from '../services/tags';

const createTagSchema = z.object({
  name: z.string().min(1).regex(NO_SLASH_REGEX, 'name cannot contain slashes').trim(),
  file: z.string().or(z.array(z.string())).optional(),
});

export type CreateTagBody = z.infer<typeof createTagSchema>;

const isTagNameUnique = z.string().refine(validateTagNameIsUnique, {
  message: 'A tag with this name already exists',
});

export default {
  async create(ctx) {
    const { user, userAbility } = ctx.state;
    const { body } = ctx.request;

    const parsedBody = await createTagSchema.parseAsync(body);

    await isTagNameUnique.parseAsync(parsedBody.name);

    const { create } = getService<ITagsService>('tags');

    const folder = await create(parsedBody, user);

    const permissionsManager =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: TAG_MODEL_UID,
      });

    const output = await permissionsManager.sanitizeOutput(folder);

    return output;
  },
  async find(ctx) {
    const {
      state: { userAbility },
    } = ctx;

    const defaultQuery: Parameters<typeof findAll>[0] = {
      select: ['uuid', 'name'],
      populate: {
        createdBy: true,
        files: {
          count: true,
        },
      },
      orderBy: {
        name: 'asc',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore it does exist thx
    const pm = strapi.admin.services.permission.createPermissionsManager({
      ability: userAbility,
      action: ACTIONS.read,
      model: TAG_MODEL_UID,
    });

    if (!pm.isAllowed) {
      return ctx.forbidden();
    }

    const query = pm.addPermissionsQueryTo({
      ...defaultQuery,
      ...ctx.query,
    });

    const { findAll } = getService<ITagsService>('tags');

    const results = await findAll(query);

    const sanitizedResults = await pm.sanitizeOutput(results);

    return sanitizedResults;
  },
} as GenericController;
