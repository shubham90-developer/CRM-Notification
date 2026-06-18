'use client'

import { useEffect } from 'react'
import socket from '@/lib/socket'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const SocketInitializer = () => {
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (!user) return

    const role = user?.role?.toLowerCase()

    if (role === 'kitchen master' || role === 'kitchen') {
      socket.emit('join-kitchen')
      console.log('Joined kitchen-room')
    }

    if (role === 'reception' || role === 'receptionist') {
      socket.emit('join-reception')
      console.log('Joined reception-room')
    }

    return () => {
      socket.disconnect()
    }
  }, [user])

  return null
}

export default SocketInitializer
