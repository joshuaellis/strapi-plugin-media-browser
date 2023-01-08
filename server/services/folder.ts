import { Strapi } from "@strapi/strapi";
import { setCreatorFields, joinBy } from "@strapi/utils";

import { FOLDER_MODEL_UID } from "../constants";

import { CreateFolderBody } from "../controllers/admin-folder";

import { getService } from "../helpers/strapi";

import { StrapiUser } from "../types/strapi";

export default ({ strapi }: { strapi: Strapi }) => ({
  async checkFolderExists(
    filters: { name?: string; id?: string | number } = {}
  ) {
    const count = await strapi
      .query(FOLDER_MODEL_UID)
      .count({ where: filters });
    return count > 0;
  },
  async create(parsedBody: CreateFolderBody, user?: StrapiUser) {
    const folderService = getService("folder");

    let enrichedFolder = await folderService.setPathIdAndPath(parsedBody);

    if (user) {
      enrichedFolder = await setCreatorFields({ user })(enrichedFolder);
    }

    const folder = await strapi.entityService.create(FOLDER_MODEL_UID, {
      data: enrichedFolder,
    });

    return folder;
  },
  async setPathIdAndPath(folder: CreateFolderBody) {
    const { max } = await strapi.db
      //  @ts-ignore it does exist thx
      .queryBuilder(FOLDER_MODEL_UID)
      .max("pathId")
      .first()
      .execute();

    const pathId = max + 1;
    let parentPath = "/";

    if (folder.parent) {
      const parentFolder = await strapi.entityService.findOne(
        FOLDER_MODEL_UID,
        folder.parent
      );
      parentPath = parentFolder.path;
    }

    return {
      ...folder,
      pathId,
      path: joinBy("/", parentPath, pathId),
    };
  },
});
