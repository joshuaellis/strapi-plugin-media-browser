import type { GenericController } from '@strapi/strapi/lib/core-api/controller';
import { errors } from '@strapi/utils';
import type Koa from 'koa';
import { isEmpty } from 'lodash';
import { z } from 'zod';

import { ACTIONS, FILE_MODEL_UID } from '../constants';
import { findEntityAndCheckPermissions } from '../helpers/permissions';
import { getService } from '../helpers/strapi';
import type { IFilesService } from '../services/files';
import type { IFolderService } from '../services/folder';

const { ApplicationError } = errors;

const uploadFileBodySchema = z.object({
  hash: z.string(),
  assetType: z.enum(['image', 'file', 'video']),
  folder: z.string(),
});

export type UploadFileBody = z.infer<typeof uploadFileBodySchema>;

interface DeleteContext extends Koa.Context {
  request: DeleteRequest;
}

interface DeleteRequest extends Koa.Request {
  body: {
    action: 'delete';
    uuid: string | string[];
    patch?: never;
  };
}

const updateFileBodySchema = z.object({
  action: z.literal('update'),
  uuid: z.union([z.string(), z.array(z.string())]),
  patch: z.object({
    tags: z
      .union([
        z.object({ set: z.array(z.string()).optional() }),
        z.object({
          connect: z.array(z.string()).optional(),
          disconnect: z.array(z.string()).optional(),
        }),
      ])
      .optional(),
  }),
});

export type UpdateFileBody = z.infer<typeof updateFileBodySchema>;

interface UpdateContext extends Koa.Context {
  request: UpdateRequest;
}

interface UpdateRequest extends Koa.Request {
  body: UpdateFileBody;
}

export default {
  async find(ctx) {
    const {
      state: { userAbility },
      params: { folder: folderName },
    } = ctx;

    const { getFolderByName } = getService<IFolderService>('folder');

    const { id } = (await getFolderByName(folderName)) ?? {};

    const defaultQuery = {
      populate: {
        folder: true,
        tags: {
          fields: ['uuid'],
        },
      },
      filters: {
        folder: !id ? null : id,
      },
      sort: { createdAt: 'desc' },
    };

    // @ts-ignore it does exist thx
    const pm = strapi.admin.services.permission.createPermissionsManager({
      ability: userAbility,
      action: ACTIONS.read,
      model: FILE_MODEL_UID,
    });

    if (!pm.isAllowed) {
      return ctx.forbidden();
    }

    const pmQuery = pm.addPermissionsQueryTo({
      ...defaultQuery,
      ...ctx.query,
    });

    const query = await pm.sanitizeQuery(pmQuery);

    const fileService: IFilesService = getService('files');

    const results = await fileService.findAll(query);

    const sanitizedResults = await pm.sanitizeOutput(results);

    return sanitizedResults;
  },
  async uploadFiles(ctx) {
    const {
      state: { userAbility, user },
      // @ts-ignore TODO: add this to the request type
      request: { body, files: { files } = {} },
    } = ctx;

    const { upload }: IFilesService = getService('files');
    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        action: ACTIONS.create,
        model: FILE_MODEL_UID,
      });

    if (!permissionsManager.isAllowed) {
      return ctx.forbidden();
    }

    const data = await uploadFileBodySchema.parseAsync(body);
    const uploadedFiles = await upload({ data, file: files }, user);

    const output = await permissionsManager.sanitizeOutput(uploadedFiles);

    return output;
  },

  async upload(ctx) {
    const {
      query: { id },
      // @ts-ignore TODO: add this to the request type
      request: { files: { files } = {} },
    } = ctx;
    if (isEmpty(files) || files.size === 0) {
      if (id) {
        // return this.updateFileInfo(ctx);
      }
      throw new ApplicationError('Files are empty');
    }

    if (id) {
      // await this.replaceFile(ctx)
    }

    const parsedOutput = await this.uploadFiles(ctx);

    return parsedOutput;
  },

  async updateFile(ctx: UpdateContext) {
    const {
      request: { body },
      state: { userAbility },
    } = ctx;

    const { uuid, patch } = await updateFileBodySchema.parseAsync(body);

    const { updateFile } = getService<IFilesService>('files');

    const uuidsToUpdate = Array.isArray(uuid) ? uuid : [uuid];

    const fileFinder = findEntityAndCheckPermissions(strapi);

    let permissionsManager: ReturnType<
      // @ts-ignore it does exist thx
      typeof strapi.admin.services.permission.createPermissionsManager
    > = undefined;
    const updatedFiles = await Promise.all(
      uuidsToUpdate.map(async (id) => {
        const { file, pm } = await fileFinder(id, {
          ability: userAbility,
          action: ACTIONS.update,
          model: FILE_MODEL_UID,
        });
        permissionsManager = pm;
        return updateFile(file.id!, patch);
      })
    );

    if (updatedFiles.length === 0) {
      return ctx.notFound('file not found');
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(updatedFiles);

    return parsedOutput;
  },

  async update(ctx: DeleteContext | UpdateContext) {
    const { body } = ctx.request;

    if (body.action === 'delete') {
      return this.deleteFile(ctx);
    } else if (body.action === 'update') {
      return this.updateFile(ctx);
    }
  },

  async deleteFile(ctx: DeleteContext) {
    const {
      request: { body },
      state: { userAbility },
    } = ctx;

    const { uuid } = body;

    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: FILE_MODEL_UID,
      });

    const { deleteFile } = getService<IFilesService>('files');

    if (!uuid) {
      return ctx.badRequest('uuid should be a string or an array of strings');
    }

    const uuidsToDelete = Array.isArray(uuid) ? uuid : [uuid];

    const fileFinder = findEntityAndCheckPermissions(strapi);

    const deletedFiles = await Promise.all(
      uuidsToDelete.map(async (id) => {
        await fileFinder(id, {
          ability: userAbility,
          action: ACTIONS.update,
          model: FILE_MODEL_UID,
        });
        return deleteFile(id);
      })
    );

    if (deletedFiles.length === 0) {
      return ctx.notFound('file not found');
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(deletedFiles);

    return parsedOutput;
  },
} as GenericController;
