import type { Strapi } from '@strapi/strapi';
import range from 'koa-range';
import koaStatic from 'koa-static';

export default ({ strapi }: { strapi: Strapi }) => {
  strapi.server.app.on('error', (err) => {
    if (err.code === 'EPIPE') {
      // when serving audio or video the browsers sometimes close the connection to go to range requests instead.
      // This causes koa to emit a write EPIPE error. We can ignore it.
      // Right now this ignores it globally and we cannot do much more because it is how koa handles it.
      return;
    }

    strapi.server.app.onerror(err);
  });

  const localServerConfig = strapi.config.get(
    'plugin.media-browser.providerOptions.localServer',
    {}
  );

  strapi.server.routes([
    {
      method: 'GET',
      path: '/media-browser/(.*)',
      handler: [
        range,
        koaStatic(strapi.dirs.static.public, {
          defer: true,
          ...localServerConfig,
        }),
      ],
      config: { auth: false },
    },
  ]);
};
