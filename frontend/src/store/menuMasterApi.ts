import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IMenuMaster {
  _id: string
  itemName: string
  image: string
  desc: string
  priority: string
  qty: string
  status: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface IMenuMasterResponse {
  success: boolean
  statusCode: number
  message: string
  data: IMenuMaster | IMenuMaster[]
}

export const menuMasterApi = createApi({
  reducerPath: 'menuMasterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState)?.auth?.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['MenuMaster'],

  endpoints: (builder) => ({
    getMenuMaster: builder.query<IMenuMaster[], void>({
      query: () => '/menu-category',
      transformResponse: (response: IMenuMasterResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['MenuMaster'],
    }),

    getMenuMasterById: builder.query<IMenuMaster, string>({
      query: (id) => `/menu-category/${id}`,
      transformResponse: (response: IMenuMasterResponse) => response.data as IMenuMaster,
      providesTags: (result, error, id) => [{ type: 'MenuMaster', id }],
    }),

    createMenuMaster: builder.mutation<IMenuMaster, FormData>({
      query: (data) => ({
        url: '/menu-category',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: IMenuMasterResponse) => response.data as IMenuMaster,
      invalidatesTags: ['MenuMaster'],
    }),
    updateMenuMaterById: builder.mutation<
      IMenuMaster,
      {
        id: string
        data: FormData
      }
    >({
      query: ({ id, data }) => ({
        url: `/menu-category/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['MenuMaster'],
    }),
    updateMenuStatus: builder.mutation<IMenuMaster, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/menu-category/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: IMenuMasterResponse) => response.data as IMenuMaster,
      invalidatesTags: ['MenuMaster'],
    }),

    deleteMenuMasterById: builder.mutation<IMenuMaster, string>({
      query: (id) => ({
        url: `/menu-category/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IMenuMasterResponse) => response.data as IMenuMaster,
      invalidatesTags: ['MenuMaster'],
    }),
  }),
})

export const {
  useGetMenuMasterQuery,
  useGetMenuMasterByIdQuery,
  useCreateMenuMasterMutation,
  useUpdateMenuMaterByIdMutation,
  useUpdateMenuStatusMutation,
  useDeleteMenuMasterByIdMutation,
} = menuMasterApi
