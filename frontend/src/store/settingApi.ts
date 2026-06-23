import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ISetting {
  _id?: string
  logo?: string
  username?: string
  notificationAudio?: string
}

interface ISettingResponse {
  message: string
  success: boolean
  statusCode: number
  data: ISetting
}

export const settingApi = createApi({
  reducerPath: 'settingApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8090/v1/api',

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState)?.auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),

  tagTypes: ['Setting'],

  endpoints: (builder) => ({
    getSettings: builder.query<ISetting, void>({
      query: () => '/general-settings',
      transformResponse: (response: ISettingResponse) => response.data,
      providesTags: ['Setting'],
    }),

    updateSettings: builder.mutation<ISetting, FormData>({
      query: (data) => ({
        url: '/general-settings',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ISettingResponse) => response.data,
      invalidatesTags: ['Setting'],
    }),
  }),
})

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingApi
