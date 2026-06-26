import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface INotification {
  _id: string
  itemName: string
  image?: string
  priority?: string
  qty?: string
  desc?: string
  status?: string
}

interface NotificationState {
  items: INotification[]
  unreadCount: number
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<INotification>) => {
      const exists = state.items.find((n) => n._id === action.payload._id)
      if (!exists) {
        state.items.unshift(action.payload)
        state.unreadCount += 1
      }
    },
    updateNotificationStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const item = state.items.find((n) => n._id === action.payload.id)
      if (item) item.status = action.payload.status
    },
    clearAll: (state) => {
      state.items = []
      state.unreadCount = 0
    },
    markAllRead: (state) => {
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n._id !== action.payload)
      if (state.unreadCount > 0) state.unreadCount -= 1
    },
  },
})

export const { addNotification, updateNotificationStatus, clearAll, markAllRead, removeNotification } = notificationSlice.actions
export default notificationSlice.reducer
