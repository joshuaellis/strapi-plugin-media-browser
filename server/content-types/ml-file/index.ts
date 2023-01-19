import { FOLDER_MODEL_UID, PLUGIN_NAME } from "../../constants";

export default {
  schema: {
    collectionName: "ml-files",
    info: {
      singularName: "ml-file",
      pluralName: "ml-files",
      displayName: "File",
      description: "",
    },
    options: {},
    pluginOptions: {
      "content-manager": {
        visible: true,
      },
      "content-type-builder": {
        visible: true,
      },
    },
    attributes: {
      uuid: {
        type: "string",
        configurable: false,
        required: true,
      },
      assetType: {
        type: "string",
        configurable: false,
        required: true,
      },
      name: {
        type: "string",
        configurable: false,
        required: true,
      },
      alternativeText: {
        type: "string",
        configurable: false,
      },
      caption: {
        type: "string",
        configurable: false,
      },
      width: {
        type: "integer",
        configurable: false,
      },
      height: {
        type: "integer",
        configurable: false,
      },
      hash: {
        type: "string",
        configurable: false,
        required: true,
      },
      ext: {
        type: "string",
        configurable: false,
      },
      mime: {
        type: "string",
        configurable: false,
        required: true,
      },
      size: {
        type: "decimal",
        configurable: false,
        required: true,
      },
      url: {
        type: "string",
        configurable: false,
        required: true,
      },
      previewUrl: {
        type: "string",
        configurable: false,
      },
      provider: {
        type: "string",
        configurable: false,
        required: true,
      },
      provider_metadata: {
        type: "json",
        configurable: false,
      },
      related: {
        type: "relation",
        relation: "morphToMany",
        configurable: false,
      },
      folder: {
        type: "relation",
        relation: "manyToOne",
        target: FOLDER_MODEL_UID,
        inversedBy: "files",
        private: true,
      },
      folderPath: {
        type: "string",
        min: 1,
        required: true,
        private: true,
      },
    },
    // experimental feature:
    indexes: [
      {
        name: `${PLUGIN_NAME}_files_folder_path_index}`,
        columns: ["folder_path"],
        type: null,
      },
      {
        name: `${PLUGIN_NAME}_files_created_at_index`,
        columns: ["created_at"],
        type: null,
      },
      {
        name: `${PLUGIN_NAME}_files_updated_at_index`,
        columns: ["updated_at"],
        type: null,
      },
      {
        name: `${PLUGIN_NAME}_files_name_index`,
        columns: ["name"],
        type: null,
      },
      {
        name: `${PLUGIN_NAME}_files_size_index`,
        columns: ["size"],
        type: null,
      },
      {
        name: `${PLUGIN_NAME}_files_ext_index`,
        columns: ["ext"],
        type: null,
      },
    ],
  },
};
