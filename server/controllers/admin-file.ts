import type { GenericController } from "@strapi/strapi/lib/core-api/controller";
import { errors } from "@strapi/utils";
import { z } from "zod";
import { isEmpty } from "lodash";

import { getService } from "../helpers/strapi";

import { ACTIONS, FILE_MODEL_UID } from "../constants";
import { IFilesService } from "../services/files";
import { IFolderService } from "../services/folder";

const { ApplicationError } = errors;

const uploadFileBodySchema = z.object({
  hash: z.string(),
  assetType: z.enum(["image", "file", "video"]),
  folder: z.string(),
});

export type UploadFileBody = z.infer<typeof uploadFileBodySchema>;

export default {
  async find(ctx) {
    const {
      state: { userAbility },
      params: { folder: folderName },
    } = ctx;

    const { getFolderByName } = getService<IFolderService>("folder");

    const { id } = (await getFolderByName(folderName)) ?? {};

    const defaultQuery = {
      populate: { folder: true },
      filters: {
        folder: !id ? null : id,
      },
      sort: { createdAt: "desc" },
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

    const fileService: IFilesService = getService("files");

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

    const { upload }: IFilesService = getService("files");
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
      throw new ApplicationError("Files are empty");
    }

    if (id) {
      // await this.replaceFile(ctx)
    }

    const parsedOutput = await this.uploadFiles(ctx);

    return parsedOutput;
  },
} as GenericController;
