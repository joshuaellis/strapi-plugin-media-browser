import { FOLDER_MODEL_UID, FILE_MODEL_UID, PLUGIN_NAME } from '../../constants';

export default {
  schema: {
    collectionName: 'ml-folders',
    info: {
      singularName: 'ml-folder',
      pluralName: 'ml-folders',
      displayName: 'Folder',
    },
    options: {},
    pluginOptions: {
      'content-manager': {
        visible: true,
      },
      'content-type-builder': {
        visible: true,
      },
    },
    attributes: {
      uuid: {
        type: 'string',
        configurable: false,
        required: true,
      },
      name: {
        type: 'string',
        min: 1,
        required: true,
      },
      pathId: {
        type: 'integer',
        unique: true,
        required: true,
      },
      parent: {
        type: 'relation',
        relation: 'manyToOne',
        target: FOLDER_MODEL_UID,
        inversedBy: 'children',
      },
      children: {
        type: 'relation',
        relation: 'oneToMany',
        target: FOLDER_MODEL_UID,
        mappedBy: 'parent',
      },
      files: {
        type: 'relation',
        relation: 'oneToMany',
        target: FILE_MODEL_UID,
        mappedBy: 'folder',
      },
      path: {
        type: 'string',
        min: 1,
        required: true,
      },
    },
    // experimental feature:
    indexes: [
      {
        name: `${PLUGIN_NAME}_folders_path_id_index`,
        columns: ['path_id'],
        type: 'unique',
      },
      {
        name: `${PLUGIN_NAME}"_folders_path_index"}`,
        columns: ['path'],
        type: 'unique',
      },
    ],
  },
};
