/* eslint-disable @typescript-eslint/ban-ts-comment */
import Koa from 'koa';
import type { GenericController } from '@strapi/strapi/lib/core-api/controller';
import { errors } from '@strapi/utils';
import { z } from 'zod';
import { isEmpty } from 'lodash';

import { getService } from '../helpers/strapi';

import { ACTIONS, FILE_MODEL_UID } from '../constants';
import { IFilesService } from '../services/files';
import { IFolderService } from '../services/folder';

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
  };
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
      populate: { folder: true },
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

    const query = pm.addPermissionsQueryTo({
      ...defaultQuery,
      ...ctx.query,
    });

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

  async update(ctx: DeleteContext) {
    const { body } = ctx.request;

    if (body.action === 'delete') {
      return this.deleteFile(ctx);
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

    const deletedFiles = await Promise.all(uuidsToDelete.map((id) => deleteFile(id)));

    if (deletedFiles.length === 0) {
      return ctx.notFound('file not found');
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(deletedFiles);

    return parsedOutput;
  },
} as GenericController;
