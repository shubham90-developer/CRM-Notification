import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface LoginRequest {
  email: string
  password: string
}

export interface UserData {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  success: boolean
  statusCode: number
  message: string
  token: string
  data: UserData
}

export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),

  endpoints: (builder) => ({
    // Get current role user from token (for rehydrating user on refresh)
    getRoleMe: builder.query<LoginResponse, void>({
      query: () => '/roles/me',
    }),

    // For admin/vendor/user (User model)
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),

    // For menu_master / kitchen_master / reception_master (Role model)
    roleLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/roles/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
})

export const { useLoginMutation, useRoleLoginMutation, useGetRoleMeQuery } = apiSlice
