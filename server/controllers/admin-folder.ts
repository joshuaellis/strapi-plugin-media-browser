import type { GenericController } from "@strapi/strapi/lib/core-api/controller";
import { defaultsDeep } from "lodash";
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
    const { user, userAbility } = ctx.state;
    const { body } = ctx.request;

    console.log(">>>>> got the request");

    const parsedBody = await createFolderBodySchema.parseAsync(body);

    const { create } = getService("folder");

    const folder = await create(parsedBody, user);

    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: FOLDER_MODEL_UID,
      });

    const output = await permissionsManager.sanitizeOutput(folder);

    return output;
  },
  async find({ query, state }) {
    const { userAbility } = state;
    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: FOLDER_MODEL_UID,
      });

    const results = await strapi.entityService.findWithRelationCounts(
      FOLDER_MODEL_UID,
      {
        ...defaultsDeep(
          {
            populate: {
              children: {
                count: true,
              },
              files: {
                count: true,
              },
            },
          },
          query
        ),
      }
    );

    const parsedResults = await permissionsManager.sanitizeOutput(results);

    return parsedResults;
  },
} as GenericController;
