import { Strapi } from "@strapi/strapi";
import { PLUGIN_NAME } from "../constants";

export const getService = (strapi: Strapi, name: string) =>
  strapi.plugin(PLUGIN_NAME).service(name);
