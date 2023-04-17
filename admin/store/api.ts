import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import { auth } from '@strapi/helper-plugin';
import axios, { type AxiosRequestConfig, AxiosError } from 'axios';

import pluginId from '../pluginId';

export interface AxiosArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  signal?: AxiosRequestConfig['signal'];
}

interface StrapiError {
  message: string;
  name: string;
  status: number;
}

const axiosBaseQuery =
  (baseUrl: string): BaseQueryFn<AxiosArgs, unknown, { status?: number; data?: StrapiError }> =>
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
    } catch (err) {
      if (err instanceof AxiosError) {
        return {
          error: {
            status: err.response?.status,
            data: err.response?.data.error || err.message,
          },
        };
      }

      return {
        error: {
          status: 500,
          data: err,
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
