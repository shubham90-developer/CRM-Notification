import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import { apiSlice } from './apiSlice'
import { roleApi } from './roleApi'
import { settingApi } from './settingApi'
import { menuMasterApi } from './menuMasterApi'
import notificationReducer from './notificationSlice'
export const store = configureStore({
  reducer: {
    auth: authSlice,
    notifications: notificationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [menuMasterApi.reducerPath]: menuMasterApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
      menuMasterApi.middleware,
      roleApi.middleware,
      settingApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
