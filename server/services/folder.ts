/* eslint-disable @typescript-eslint/ban-ts-comment */
import { nanoid } from 'nanoid';
import { Strapi } from '@strapi/strapi';
import { setCreatorFields, joinBy } from '@strapi/utils';

import { FILE_MODEL_UID, FOLDER_MODEL_UID } from '../constants';

import { CreateFolderBody, UpdateFolderId, UpdateFolderPatch } from '../controllers/admin-folder';

import { StrapiUser } from '../types/strapi';

export interface FolderEntity {
  name: string;
  createdAt: string;
  id: number;
  path: string;
  pathId: number;
  updatedAt: string;
}

interface StrapiQueryFolderFilters {
  name?: string;
  id?:
    | string
    | number
    | {
        $ne: string;
      };
}

export interface IFolderService {
  /**
   * Create a new folder
   */
  create: (parsedBody: CreateFolderBody, user?: StrapiUser) => Promise<FolderEntity>;
  /**
   * Update a folder based on it's ID and a patch file
   */
  update: (
    id: UpdateFolderId,
    { name, parent }: UpdateFolderPatch,
    user?: StrapiUser
  ) => Promise<FolderEntity | undefined>;
  /**
   * Delete folders based on IDs
   */
  delete: (id: string[]) => Promise<{
    folders: FolderEntity[];
    totalFolderNumber: number;
    totalFileNumber: number;
  }>;
  /**
   * Get the path of a folder based on it's id
   */
  getPath: (folderId?: number) => Promise<string>;
  getFolderByName: (name: string) => Promise<Pick<FolderEntity, 'id' | 'name'>>;
  /**
   * Check if a folder exists based on a query
   */
  checkFolderExists(filters?: StrapiQueryFolderFilters): Promise<boolean>;
}

class FolderService implements IFolderService {
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  checkFolderExists = async (filters = {}) => {
    const count = await this.strapi.query(FOLDER_MODEL_UID).count({ where: filters });
    return count > 0;
  };

  getFolderByName = async (name: string) => {
    const [folder] = await this.strapi.entityService.findMany(FOLDER_MODEL_UID, {
      fields: ['id', 'name'],
      filters: {
        name,
      },
    });

    return folder;
  };

  getPath = async (folderId?: number): Promise<string> => {
    if (!folderId) return '/';

    const parentFolder = await this.strapi.entityService.findOne(FOLDER_MODEL_UID, folderId);

    return parentFolder.path;
  };

  create = async (parsedBody: CreateFolderBody, user?: StrapiUser) => {
    const { max } = await this.strapi.db
      //  @ts-ignore it does exist thx
      .queryBuilder(FOLDER_MODEL_UID)
      .max('pathId')
      .first()
      .execute();

    const pathId = max + 1;
    let parentPath = '/';

    if (parsedBody.parent) {
      const parentFolder = await this.strapi.entityService.findOne(
        FOLDER_MODEL_UID,
        parsedBody.parent
      );
      parentPath = parentFolder.path;
    }

    let enrichedFolder = {
      ...parsedBody,
      uuid: nanoid(),
      pathId,
      path: joinBy('/', parentPath, parsedBody.name),
    };

    if (user) {
      enrichedFolder = await setCreatorFields({ user })(enrichedFolder);
    }

    const folder = await this.strapi.entityService.create(FOLDER_MODEL_UID, {
      data: enrichedFolder,
    });

    return folder;
  };

  update = async (
    id: UpdateFolderId,
    { name, parent }: UpdateFolderPatch,
    user?: StrapiUser
  ): Promise<FolderEntity | undefined> => {
    // only name is updated
    if (parent === undefined) {
      const existingFolder = await this.strapi.entityService.findOne(FOLDER_MODEL_UID, id);

      if (!existingFolder) {
        return undefined;
      }

      const newFolder = setCreatorFields({ user, isEdition: true })({
        name,
        parent,
      });

      if (parent === undefined) {
        const folder = await this.strapi.entityService.update(FOLDER_MODEL_UID, id, {
          data: newFolder,
        });
        return folder;
      }
      // location is updated => using transaction
    } else {
      // @ts-ignore
      const trx = await this.strapi.db.transaction();
      try {
        // fetch existing folder
        const existingFolder = await this.strapi.db
          // @ts-ignore
          .queryBuilder(FOLDER_MODEL_UID)
          .select(['pathId', 'path'])
          .where({ id })
          .transacting(trx)
          .forUpdate()
          .first()
          .execute();

        // update parent folder (delete + insert; upsert not possible)
        const { joinTable } =
          // @ts-ignore
          this.strapi.db.metadata.get(FOLDER_MODEL_UID).attributes.parent;
        await this.strapi.db
          // @ts-ignore
          .queryBuilder(joinTable.name)
          .transacting(trx)
          .delete()
          .where({ [joinTable.joinColumn.name]: id })
          .execute();

        if (parent !== null) {
          await this.strapi.db
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
        let destinationFolderPath = '/';
        if (parent !== null) {
          const destinationFolder = await this.strapi.db
            // @ts-ignore
            .queryBuilder(FOLDER_MODEL_UID)
            .select('path')
            .where({ id: parent })
            .transacting(trx)
            .first()
            .execute();
          destinationFolderPath = destinationFolder.path;
        }

        const folderTable = this.strapi.getModel(FOLDER_MODEL_UID).collectionName;
        const fileTable = this.strapi.getModel(FILE_MODEL_UID).collectionName;
        const folderPathColumnName =
          // @ts-ignore
          this.strapi.db.metadata.get(FILE_MODEL_UID).attributes.folderPath.columnName;
        const pathColumnName =
          // @ts-ignore
          this.strapi.db.metadata.get(FOLDER_MODEL_UID).attributes.path.columnName;

        // update folders below
        await this.strapi.db
          // @ts-ignore
          .getConnection(folderTable)
          .transacting(trx)
          .where(pathColumnName, existingFolder.path)
          .orWhere(pathColumnName, 'like', `${existingFolder.path}/%`)
          .update(
            pathColumnName,
            // @ts-ignore
            this.strapi.db.connection.raw('REPLACE(??, ?, ?)', [
              pathColumnName,
              existingFolder.path,
              joinBy('/', destinationFolderPath, existingFolder.pathId),
            ])
          );

        // update files below
        await this.strapi.db
          // @ts-ignore
          .getConnection(fileTable)
          .transacting(trx)
          .where(folderPathColumnName, existingFolder.path)
          .orWhere(folderPathColumnName, 'like', `${existingFolder.path}/%`)
          .update(
            folderPathColumnName,
            // @ts-ignore
            this.strapi.db.connection.raw('REPLACE(??, ?, ?)', [
              folderPathColumnName,
              existingFolder.path,
              joinBy('/', destinationFolderPath, existingFolder.pathId),
            ])
          );

        await trx.commit();
      } catch (e) {
        await trx.rollback();
        throw e;
      }

      // update less critical information (name + updatedBy)
      const newFolder = setCreatorFields({ user, isEdition: true })({ name });

      const folder = await this.strapi.entityService.update(FOLDER_MODEL_UID, id, {
        data: newFolder,
      });

      return folder;
    }
  };

  delete = async (ids: string[]) => {
    const folders = (await this.strapi.db
      .query(FOLDER_MODEL_UID)
      .findMany({ where: { id: { $in: ids } } })) as FolderEntity[];

    if (folders.length === 0) {
      return {
        folders: [],
        totalFolderNumber: 0,
        totalFileNumber: 0,
      };
    }

    const pathsToDelete = folders.map((fold) => fold.path);

    // delete files
    const filesToDelete = await this.strapi.db.query(FILE_MODEL_UID).findMany({
      where: {
        $or: pathsToDelete.map((path) => ({
          folderPath: { $startsWith: path },
        })),
      },
    });

    // TODO: when files can be deleted, add this back in
    // await Promise.all(filesToDelete.map((file) => getService('upload').remove(file)));

    // delete folders
    const { count: totalFolderNumber } = await this.strapi.db.query(FOLDER_MODEL_UID).deleteMany({
      where: {
        $or: pathsToDelete.map((path) => ({ path: { $startsWith: path } })),
      },
    });

    return {
      folders,
      totalFolderNumber,
      totalFileNumber: filesToDelete.length,
    };
  };
}

export default ({ strapi }: { strapi: Strapi }): IFolderService => {
  const service = new FolderService(strapi);

  return {
    create: service.create,
    update: service.update,
    delete: service.delete,
    getPath: service.getPath,
    checkFolderExists: service.checkFolderExists,
    getFolderByName: service.getFolderByName,
  };
};
