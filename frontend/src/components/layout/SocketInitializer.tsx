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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data: meData } = useGetRoleMeQuery(undefined, {
    skip: !token || !!user,
  })
  const { data: settings } = useGetSettingsQuery()

  useEffect(() => {
    if (meData?.data && meData?.token) {
      dispatch(setCredentials({ token: meData.token, user: meData.data }))
    }
  }, [meData, dispatch])

  // Create audio element once
  useEffect(() => {
    audioRef.current = new Audio(settings?.notificationAudio || '/1.mp3')
    audioRef.current.loop = false
  }, [settings?.notificationAudio])

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

    // ✅ Listen for new orders and add them to Redux list
    const handleNewNotification = (data: any) => {
      dispatch(addNotification(data))
      toast.info(`🔔 New Order: ${data.itemName}`)

      // Play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
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
