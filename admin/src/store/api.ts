import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { auth } from "@strapi/helper-plugin";

import pluginId from "../pluginId";

const axiosBaseQuery =
  (
    baseUrl: string
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      onUploadProgress?: AxiosRequestConfig["onUploadProgress"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({
    url,
    method = "GET",
    data,
    params,
    onUploadProgress,
    headers = {},
  }) => {
    try {
      const result = await axios({
        url: `${baseUrl}/${url}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getToken()}`,
          ...headers,
        },
        method,
        data,
        params,
        onUploadProgress,
      });
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const strapiAdminApi = createApi({
  reducerPath: "strapiAdminApi",
  baseQuery: axiosBaseQuery(
    `${process.env.STRAPI_ADMIN_BACKEND_URL}/${pluginId}`
  ),
  tagTypes: ["Folders"],
  endpoints: () => ({}),
});
