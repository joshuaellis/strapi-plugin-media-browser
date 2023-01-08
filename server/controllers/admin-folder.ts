import type { GenericController } from "@strapi/strapi/lib/core-api/controller";
import { z } from "zod";

import { getService, validateValueIsStrapiId } from "../helpers/strapi";
import {
  validateFolderNameIsUnique,
  validateFolderExists,
} from "../helpers/folders";

import { FOLDER_MODEL_UID } from "../constants";

const NO_SLASH_REGEX = /^[^/]+$/;

const createFolderBodySchema = z
  .object({
    name: z
      .string()
      .min(1)
      .regex(NO_SLASH_REGEX, "name cannot contain slashes")
      .trim()
      .refine(validateFolderNameIsUnique, {
        message: "A folder with this name already exists",
      }),
    parent: z
      .custom<string | number>(validateValueIsStrapiId)
      .nullable()
      .refine(validateFolderExists, {
        message: "parent folder does not exist",
      }),
  })
  .required();

export type CreateFolderBody = z.infer<typeof createFolderBodySchema>;

export default {
  async create(ctx) {
    const { user } = ctx.state;
    const { body } = ctx.request;

    const parsedBody = await createFolderBodySchema.parseAsync(body);

    const { create } = getService("folder");

    const folder = await create(parsedBody, user);

    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: ctx.state.userAbility,
        model: FOLDER_MODEL_UID,
      });

    const output = await permissionsManager.sanitizeOutput(folder);

    return output;
  },
} as GenericController;
