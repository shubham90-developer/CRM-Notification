import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface INotification {
  _id: string
  itemName: string
  image?: string
  priority?: string
  qty?: string
  desc?: string
  seenAt?: string
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
      // avoid duplicates
      const exists = state.items.find((n) => n._id === action.payload._id)
      if (!exists) {
        state.items.unshift(action.payload)
        state.unreadCount += 1
      }
    },
    clearAll: (state) => {
      state.items = []
      state.unreadCount = 0
    },
    markAllRead: (state) => {
      state.unreadCount = 0
    },
  },
})

export const { addNotification, clearAll, markAllRead } = notificationSlice.actions
export default notificationSlice.reducer
