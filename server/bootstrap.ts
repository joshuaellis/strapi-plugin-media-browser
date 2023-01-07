import { PLUGIN_NAME } from "./constants";

export default async () => {
  await registerPermissionActions();
};

const registerPermissionActions = async () => {
  const actions = [
    {
      section: "plugins",
      displayName: "Access the Media Library",
      uid: "read",
      pluginName: PLUGIN_NAME,
    },
    {
      section: "plugins",
      displayName: "Create (upload)",
      uid: "assets.create",
      subCategory: "assets",
      pluginName: PLUGIN_NAME,
    },
    {
      section: "plugins",
      displayName: "Update (crop, details, replace) + delete",
      uid: "assets.update",
      subCategory: "assets",
      pluginName: PLUGIN_NAME,
    },
    {
      section: "plugins",
      displayName: "Download",
      uid: "assets.download",
      subCategory: "assets",
      pluginName: PLUGIN_NAME,
    },
    {
      section: "plugins",
      displayName: "Copy link",
      uid: "assets.copy-link",
      subCategory: "assets",
      pluginName: PLUGIN_NAME,
    },
    {
      section: "plugins",
      displayName: "Configure view",
      uid: "configure-view",
      pluginName: PLUGIN_NAME,
    },
    {
      section: "settings",
      displayName: "Access the Media Library settings page",
      uid: "settings.read",
      category: "media library",
      pluginName: PLUGIN_NAME,
    },
  ];

  // @ts-ignore it does exist thx
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
