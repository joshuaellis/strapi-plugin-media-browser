import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "@strapi/helper-plugin";

import pluginId from "../pluginId";

export const strapiAdminApi = createApi({
  reducerPath: "strapiAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.STRAPI_ADMIN_BACKEND_URL}/${pluginId}`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.getToken()}`,
    },
  }),
  tagTypes: ["Folders"],
  endpoints: () => ({}),
});
