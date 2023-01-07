import { Strapi } from "@strapi/strapi";

import { PLUGIN_NAME } from "../constants";

export default ({ strapi }: { strapi: Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin(PLUGIN_NAME)
      .service("myService")
      .getWelcomeMessage();
  },
});
