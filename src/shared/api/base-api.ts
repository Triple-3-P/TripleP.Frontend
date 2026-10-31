import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    credentials: 'same-origin',
    timeout: 15000,
  }),
  endpoints: () => ({}),
});
