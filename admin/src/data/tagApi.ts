import { z } from 'zod';

import { strapiAdminApi } from '../store/api';

const tagSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  files: z.object({
    count: z.number(),
  }),
  createdBy: z
    .object({
      firstname: z.string(),
      lastname: z.string(),
    })
    .optional(),
});

export type TagEntity = z.infer<typeof tagSchema>;

const tagApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTags: build.query<TagEntity[], undefined>({
      query: () => {
        return {
          url: `tags`,
        };
      },
      transformResponse: (res: Partial<TagEntity>[]) =>
        res
          .filter((tag) => {
            return tagSchema.safeParse(tag).success;
          })
          .map((tag) => tagSchema.parse(tag)),
      providesTags: ['Tags'],
    }),
  }),
  overrideExisting: false,
});

const { useGetAllTagsQuery } = tagApi;

export { useGetAllTagsQuery };

export const useTagMutationApi = () => {
  return {};
};
