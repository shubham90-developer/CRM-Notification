import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IRole {
  _id: string
  employeeId: string
  employeeName: string
  role: string
  email: string
  password: string
  permissions: string[]
}

interface IRoleResponse {
  success: boolean
  statusCode: number
  message: string
  data: IRole
}

export const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://31.97.207.6:8090/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState)?.auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Role'],
  endpoints: (builder) => ({
    // get all api
    getRole: builder.query<IRole[], void>({
      query: () => ({
        url: '/roles',
        method: 'GET',
      }),
      transformResponse: (response: IRoleResponse): IRole[] => {
        return Array.isArray(response.data) ? response.data : [response.data]
      },
      providesTags: ['Role'],
    }),

    // get by id
    getRoleById: builder.query<IRole, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: IRoleResponse) => response.data as IRole,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),

    // create api
    createRole: builder.mutation<IRole, FormData>({
      query: (formData) => ({
        url: '/roles',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: IRoleResponse) => response.data as IRole,
      invalidatesTags: ['Role'],
    }),

    // update api
    updateRole: builder.mutation<IRole, { id: string; data: IRole }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),

      transformResponse: (response: IRoleResponse) => response.data as IRole,

      invalidatesTags: ['Role'],
    }),

    // delete api
    deleteRole: builder.mutation<IRole, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: IRoleResponse) => response.data as IRole,
      invalidatesTags: ['Role'],
    }),
  }),
})

export const { useGetRoleQuery, useGetRoleByIdQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roleApi
