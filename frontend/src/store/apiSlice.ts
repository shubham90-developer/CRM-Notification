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
    baseUrl: 'https://crm-notification-o416.onrender.com/v1/api',

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

export const { useLoginMutation, useRoleLoginMutation } = apiSlice
