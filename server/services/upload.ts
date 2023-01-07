import { Strapi } from "@strapi/strapi";
import { FILE_MODEL_UID } from "../constants";

export default ({ strapi }: { strapi: Strapi }) => ({
  findPage(query) {
    return strapi.entityService.findPage(FILE_MODEL_UID, query);
  },
});
