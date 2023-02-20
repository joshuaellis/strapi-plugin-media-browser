import { FILE_MODEL_UID } from '../../constants';

export default {
  schema: {
    collectionName: 'ml-tags',
    info: {
      singularName: 'ml-tag',
      pluralName: 'ml-tags',
      displayName: 'Tag',
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
      files: {
        type: 'relation',
        relation: 'manyToMany',
        target: FILE_MODEL_UID,
        mappedBy: 'tags',
      },
    },
  },
};
