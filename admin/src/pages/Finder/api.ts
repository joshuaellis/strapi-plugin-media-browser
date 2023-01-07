import { strapiAdminApi } from "../../store";

const finderApi = strapiAdminApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFiles: build.query({
      query: () => ({ url: "files" }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllFilesQuery } = finderApi;
