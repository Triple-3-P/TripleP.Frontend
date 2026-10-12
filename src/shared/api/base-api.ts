import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  // Relative URLs only until the backend defines its connection contract.
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: () => ({}),
});
