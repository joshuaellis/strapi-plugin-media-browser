import { Strapi } from "@strapi/strapi";
import { setCreatorFields, joinBy } from "@strapi/utils";

import { FILE_MODEL_UID, FOLDER_MODEL_UID } from "../constants";

import {
  CreateFolderBody,
  UpdateFolderId,
  UpdateFolderPatch,
} from "../controllers/admin-folder";

import { getService } from "../helpers/strapi";

import { Folder, StrapiUser } from "../types/strapi";

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
  async update(
    id: UpdateFolderId,
    { name, parent }: UpdateFolderPatch,
    user?: StrapiUser
  ) {
    // only name is updated
    if (parent === undefined) {
      const existingFolder = await strapi.entityService.findOne(
        FOLDER_MODEL_UID,
        id
      );

      if (!existingFolder) {
        return undefined;
      }

      const newFolder = setCreatorFields({ user, isEdition: true })({
        name,
        parent,
      });

      if (parent === undefined) {
        const folder = await strapi.entityService.update(FOLDER_MODEL_UID, id, {
          data: newFolder,
        });
        return folder;
      }
      // location is updated => using transaction
    } else {
      // @ts-ignore
      const trx = await strapi.db.transaction();
      try {
        // fetch existing folder
        const existingFolder = await strapi.db
          // @ts-ignore
          .queryBuilder(FOLDER_MODEL_UID)
          .select(["pathId", "path"])
          .where({ id })
          .transacting(trx)
          .forUpdate()
          .first()
          .execute();

        // update parent folder (delete + insert; upsert not possible)
        const { joinTable } =
          // @ts-ignore
          strapi.db.metadata.get(FOLDER_MODEL_UID).attributes.parent;
        await strapi.db
          // @ts-ignore
          .queryBuilder(joinTable.name)
          .transacting(trx)
          .delete()
          .where({ [joinTable.joinColumn.name]: id })
          .execute();

        if (parent !== null) {
          await strapi.db
            // @ts-ignore
            .queryBuilder(joinTable.name)
            .transacting(trx)
            .insert({
              [joinTable.inverseJoinColumn.name]: parent,
              [joinTable.joinColumn.name]: id,
            })
            .where({ [joinTable.joinColumn.name]: id })
            .execute();
        }

        // fetch destinationFolder path
        let destinationFolderPath = "/";
        if (parent !== null) {
          const destinationFolder = await strapi.db
            // @ts-ignore
            .queryBuilder(FOLDER_MODEL_UID)
            .select("path")
            .where({ id: parent })
            .transacting(trx)
            .first()
            .execute();
          destinationFolderPath = destinationFolder.path;
        }

        const folderTable = strapi.getModel(FOLDER_MODEL_UID).collectionName;
        const fileTable = strapi.getModel(FILE_MODEL_UID).collectionName;
        const folderPathColumnName =
          // @ts-ignore
          strapi.db.metadata.get(FILE_MODEL_UID).attributes.folderPath
            .columnName;
        const pathColumnName =
          // @ts-ignore
          strapi.db.metadata.get(FOLDER_MODEL_UID).attributes.path.columnName;

        // update folders below
        await strapi.db
          // @ts-ignore
          .getConnection(folderTable)
          .transacting(trx)
          .where(pathColumnName, existingFolder.path)
          .orWhere(pathColumnName, "like", `${existingFolder.path}/%`)
          .update(
            pathColumnName,
            // @ts-ignore
            strapi.db.connection.raw("REPLACE(??, ?, ?)", [
              pathColumnName,
              existingFolder.path,
              joinBy("/", destinationFolderPath, existingFolder.pathId),
            ])
          );

        // update files below
        await strapi.db
          // @ts-ignore
          .getConnection(fileTable)
          .transacting(trx)
          .where(folderPathColumnName, existingFolder.path)
          .orWhere(folderPathColumnName, "like", `${existingFolder.path}/%`)
          .update(
            folderPathColumnName,
            // @ts-ignore
            strapi.db.connection.raw("REPLACE(??, ?, ?)", [
              folderPathColumnName,
              existingFolder.path,
              joinBy("/", destinationFolderPath, existingFolder.pathId),
            ])
          );

        await trx.commit();
      } catch (e) {
        await trx.rollback();
        throw e;
      }

      // update less critical information (name + updatedBy)
      const newFolder = setCreatorFields({ user, isEdition: true })({ name });
      const folder = await strapi.entityService.update(FOLDER_MODEL_UID, id, {
        data: newFolder,
      });
      return folder;
    }
  },
  async deleteByIds(ids: string[]) {
    console.log(ids);
    const folders = (await strapi.db
      .query(FOLDER_MODEL_UID)
      .findMany({ where: { id: { $in: ids } } })) as Folder[];

    if (folders.length === 0) {
      return {
        folders: [],
        totalFolderNumber: 0,
        totalFileNumber: 0,
      };
    }

    const pathsToDelete = folders.map((fold) => fold.path);

    // delete files
    const filesToDelete = await strapi.db.query(FILE_MODEL_UID).findMany({
      where: {
        $or: pathsToDelete.map((path) => ({
          folderPath: { $startsWith: path },
        })),
      },
    });

    // TODO: when files can be deleted, add this back in
    // await Promise.all(filesToDelete.map((file) => getService('upload').remove(file)));

    // delete folders
    const { count: totalFolderNumber } = await strapi.db
      .query(FOLDER_MODEL_UID)
      .deleteMany({
        where: {
          $or: pathsToDelete.map((path) => ({ path: { $startsWith: path } })),
        },
      });

    return {
      folders,
      totalFolderNumber,
      totalFileNumber: filesToDelete.length,
    };
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
