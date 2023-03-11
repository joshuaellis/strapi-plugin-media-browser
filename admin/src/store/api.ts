import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import { auth } from '@strapi/helper-plugin';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

import pluginId from '../pluginId';

export interface AxiosArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  signal?: AxiosRequestConfig['signal'];
}

const axiosBaseQuery =
  (baseUrl: string): BaseQueryFn<AxiosArgs, unknown, unknown> =>
  async ({ url, method = 'GET', data, params, headers = {}, signal }) => {
    try {
      const result = await axios({
        url: `${baseUrl}/${url}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getToken()}`,
          ...headers,
        },
        method,
        data,
        params,
        signal,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const strapiAdminApi = createApi({
  reducerPath: 'strapiAdminApi',
  baseQuery: axiosBaseQuery(`${process.env.STRAPI_ADMIN_BACKEND_URL}/${pluginId}`),
  tagTypes: ['Folders', 'Files', 'Tags'],
  endpoints: () => ({}),
});
