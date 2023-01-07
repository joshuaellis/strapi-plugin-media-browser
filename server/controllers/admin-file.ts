import type { GenericController } from "@strapi/strapi/lib/core-api/controller";

import { getService } from "../helpers/strapi";

import { ACTIONS, FILE_MODEL_UID } from "../constants";

export default {
  async find(ctx) {
    const {
      state: { userAbility },
    } = ctx;

    const defaultQuery = { populate: { folder: true } };

    // @ts-ignore it does exist thx
    const pm = strapi.admin.services.permission.createPermissionsManager({
      ability: userAbility,
      action: ACTIONS.read,
      model: FILE_MODEL_UID,
    });

    if (!pm.isAllowed) {
      return ctx.forbidden();
    }

    const query = pm.addPermissionsQueryTo({ ...defaultQuery, ...ctx.query });

    const { results, pagination } = await getService(strapi, "upload").findPage(
      query
    );

    const sanitizedResults = await pm.sanitizeOutput(results);

    return { results: sanitizedResults, pagination };
  },
} as GenericController;
