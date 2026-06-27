'use client'

import { useEffect, useRef } from 'react'
import socket from '@/lib/socket'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useGetRoleMeQuery } from '@/store/apiSlice'
import { setCredentials } from '@/store/authSlice'
import { addNotification } from '@/store/notificationSlice'
import { toast } from 'react-toastify'
import { useGetSettingsQuery } from '@/store/settingApi'

const SocketInitializer = () => {
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  const { data: meData } = useGetRoleMeQuery(undefined, {
    skip: !token || !!user,
  })

  useEffect(() => {
    if (meData?.data && meData?.token) {
      dispatch(setCredentials({ token: meData.token, user: meData.data }))
    }
  }, [meData, dispatch])

  useEffect(() => {
    if (!user) return

    const role = user?.role?.toLowerCase()

    const joinRoom = () => {
      if (role === 'kitchen_master') {
        socket.emit('join-kitchen')
      }
      if (role === 'reception_master') {
        socket.emit('join-reception')
      }
    }

    if (socket.connected) {
      joinRoom()
    } else {
      socket.once('connect', joinRoom)
    }

    const handleNewNotification = (data: any) => {
      dispatch(addNotification(data))
      toast.info(`🔔 New Order: ${data.itemName}`)
    }

    socket.on('new-menu-notification', handleNewNotification)

    return () => {
      socket.off('connect', joinRoom)
      socket.off('new-menu-notification', handleNewNotification)
    }
  }, [user, dispatch])

  return null
}

export default SocketInitializer
