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
      .trim(),
    parent: z
      .custom<string | number>(validateValueIsStrapiId)
      .nullable()
      .refine(validateFolderExists, {
        message: "parent folder does not exist",
      }),
  })
  .required();

export type CreateFolderBody = z.infer<typeof createFolderBodySchema>;

const updateFolderBodySchema = z.object({
  id: z.custom<string | number>(validateValueIsStrapiId),
  patch: z.object({
    name: z
      .string()
      .min(1)
      .regex(NO_SLASH_REGEX, "name cannot contain slashes")
      .trim()
      .optional(),
    parent: z
      .custom<string | number>(validateValueIsStrapiId)
      .nullable()
      .refine(validateFolderExists, {
        message: "parent folder does not exist",
      })
      .optional(),
  }),
});

type UpdateFolderBody = z.infer<typeof updateFolderBodySchema>;

export type UpdateFolderId = UpdateFolderBody["id"];
export type UpdateFolderPatch = UpdateFolderBody["patch"];

const isFolderNameUniqueInParent = (id?: string | number | null) =>
  z.string().refine(validateFolderNameIsUnique(id?.toString()), {
    message: "A folder with this name already exists",
  });

const deleteFolderBodySchema = z.object({
  id: z.custom<string | number>(validateValueIsStrapiId),
});

export default {
  async create(ctx) {
    const { user, userAbility } = ctx.state;
    const { body } = ctx.request;

    const parsedBody = await createFolderBodySchema.parseAsync(body);

    await isFolderNameUniqueInParent(parsedBody.parent).parseAsync(
      parsedBody.name
    );

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
  async update(ctx) {
    const { user, userAbility } = ctx.state;
    const { body } = ctx.request;

    const { id, patch } = updateFolderBodySchema.parse(body);

    if (patch.name || patch.parent) {
      const currentFolder = await strapi.entityService.findOne(
        FOLDER_MODEL_UID,
        id
      );

      await isFolderNameUniqueInParent(
        patch.parent ?? currentFolder.parent
      ).parseAsync(patch.name ?? currentFolder.name);
    }

    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: FOLDER_MODEL_UID,
      });

    const { update } = getService("folder");

    const updatedFolder = await update(id, patch, user);

    if (!updatedFolder) {
      return ctx.notFound("folder not found");
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(updatedFolder);

    return parsedOutput;
  },
  async delete(ctx) {
    const { userAbility } = ctx.state;
    const { id } = ctx.params;

    const permissionsManager =
      // @ts-ignore it does exist thx
      strapi.admin.services.permission.createPermissionsManager({
        ability: userAbility,
        model: FOLDER_MODEL_UID,
      });

    const { deleteByIds } = getService("folder");

    const deletedFolders = await deleteByIds([id]);

    if (deletedFolders.folders.length === 0) {
      return ctx.notFound("folder not found");
    }

    const parsedOutput = await permissionsManager.sanitizeOutput(
      deletedFolders
    );

    return parsedOutput;
  },
} as GenericController;
