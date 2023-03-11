import { PLUGIN_NAME } from './constants';

export default async () => {
  await registerPermissionActions();
};

const registerPermissionActions = async () => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access the Media Browser',
      uid: 'read',
      pluginName: PLUGIN_NAME,
    },
    {
      section: 'plugins',
      displayName: 'Create (upload)',
      uid: 'assets.create',
      subCategory: 'assets',
      pluginName: PLUGIN_NAME,
    },
    {
      section: 'plugins',
      displayName: 'Update (crop, details, replace)',
      uid: 'assets.update',
      subCategory: 'assets',
      pluginName: PLUGIN_NAME,
    },
    {
      section: 'plugins',
      displayName: 'Delete',
      uid: 'assets.delete',
      subCategory: 'assets',
      pluginName: PLUGIN_NAME,
    },
    {
      section: 'plugins',
      displayName: 'Download',
      uid: 'assets.download',
      subCategory: 'assets',
      pluginName: PLUGIN_NAME,
    },
    {
      section: 'plugins',
      displayName: 'Copy link',
      uid: 'assets.copy-link',
      subCategory: 'assets',
      pluginName: PLUGIN_NAME,
    },
    {
      section: 'settings',
      displayName: 'Access the Media Browser settings page',
      uid: 'settings.read',
      category: 'media browser',
      pluginName: PLUGIN_NAME,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore it does exist thx
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
