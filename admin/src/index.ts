import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import pluginId from './pluginId';
import pluginPkg from '../../package.json';

const name = pluginPkg.strapi.name;

export default {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Media Browser',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    const plugin = {
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    };

    app.registerPlugin(plugin);
  },

  // bootstrap(app) {},
};
