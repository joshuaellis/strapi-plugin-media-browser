const PLUGIN_NAME = "media-library";
const PLUGIN_PREFIX = `plugin::${PLUGIN_NAME}`;

const ACTIONS = {
  read: `${PLUGIN_PREFIX}.read`,
  create: `${PLUGIN_PREFIX}.create`,
  update: `${PLUGIN_PREFIX}.update`,
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
