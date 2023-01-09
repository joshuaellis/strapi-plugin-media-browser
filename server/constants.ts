const PLUGIN_NAME = "media-library";
const PLUGIN_PREFIX = `plugin::${PLUGIN_NAME}`;

const ACTIONS = {
  read: `${PLUGIN_PREFIX}.read`,
  create: `${PLUGIN_PREFIX}.assets.create`,
  update: `${PLUGIN_PREFIX}.assets.update`,
  delete: `${PLUGIN_PREFIX}.assets.delete`,
};

const FOLDER_MODEL_UID = `${PLUGIN_PREFIX}.ml-folder`;
const FILE_MODEL_UID = `${PLUGIN_PREFIX}.ml-file`;

export {
  PLUGIN_NAME,
  PLUGIN_PREFIX,
  ACTIONS,
  FOLDER_MODEL_UID,
  FILE_MODEL_UID,
};
