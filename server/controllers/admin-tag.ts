import type { GenericController } from '@strapi/strapi/lib/core-api/controller';
import type Koa from 'koa';
import { z } from 'zod';

import { ACTIONS, TAG_MODEL_UID } from '../constants';
import { NO_SLASH_REGEX } from '../helpers/regex';
import { getService } from '../helpers/strapi';
import { validateTagNameIsUnique } from '../helpers/tags';
import type { ITagsService, TagEntityPatch } from '../services/tags';

const createTagSchema = z.object({
  name: z.string().min(1).regex(NO_SLASH_REGEX, 'name cannot contain slashes').trim(),
  file: z.string().or(z.array(z.string())).optional(),
});

export type CreateTagBody = z.infer<typeof createTagSchema>;

const isTagNameUnique = z.string().refine(validateTagNameIsUnique, {
  message: 'A tag with this name already exists',
});

interface UpdateContext extends Koa.Context {
  request: UpdateRequest;
}

interface UpdateRequest extends Koa.Request {
  body: TagEntityPatch & { uuid: string };
}

export default {
  async create(ctx) {
    const { user, userAbility } = ctx.state;
    const { body } = ctx.request;

    const parsedBody = await createTagSchema.parseAsync(body);

    await isTagNameUnique.parseAsync(parsedBody.name);

    const { create } = getService<ITagsService>('tags');

    const tag = await create(parsedBody, user);

    const permissionsManager =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: TAG_MODEL_UID,
      });

    const output = await permissionsManager.sanitizeOutput(tag);

    return output;
  },
  async find(ctx) {
    const {
      state: { userAbility },
    } = ctx;

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
      ...ctx.query,
    });

    const { findAll } = getService<ITagsService>('tags');

    const results = await findAll(query);

    const sanitizedResults = await pm.sanitizeOutput(results);

    return sanitizedResults;
  },
  async delete(ctx) {
    const { userAbility } = ctx.state;
    const { uuid } = ctx.params;

    const permissionsManager =
      // @ts-expect-error it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: TAG_MODEL_UID,
      });

    const { delete: deleteTag } = getService<ITagsService>('tags');

    const deletedTags = await deleteTag([uuid]);

    if (deletedTags.tags.length === 0) {
      return ctx.notFound('tag not found');
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(deletedTags);

    return parsedOutput;
  },
  async update(ctx: UpdateContext) {
    const { userAbility } = ctx.state;
    const {
      body: { uuid, ...restBody },
    } = ctx.request;

    const permissionsManager =
      // @ts-expect-error it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: TAG_MODEL_UID,
      });

    const { update } = getService<ITagsService>('tags');

    const updatedTag = await update(uuid, restBody);

    if (!updatedTag) {
      return ctx.notFound('tag not found');
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(updatedTag);

    return parsedOutput;
  },
} as GenericController;
