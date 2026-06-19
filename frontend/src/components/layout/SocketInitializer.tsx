'use client'

import { useEffect } from 'react'
import socket from '@/lib/socket'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useGetRoleMeQuery } from '@/store/apiSlice'
import { setCredentials } from '@/store/authSlice'

const SocketInitializer = () => {
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  // If token exists but user is null (happens after page refresh),
  // call /roles/me to rehydrate user into Redux
  const { data: meData } = useGetRoleMeQuery(undefined, {
    skip: !token || !!user,
  })

  useEffect(() => {
    if (meData?.data && meData?.token) {
      dispatch(setCredentials({ token: meData.token, user: meData.data }))
    }
  }, [meData, dispatch])

  // Join socket room once user is available
  useEffect(() => {
    if (!user) return

    const role = user?.role?.toLowerCase()

    console.log('SocketInitializer: user role =', role)

    const joinRoom = () => {
      if (role === 'kitchen_master') {
        socket.emit('join-kitchen')
        console.log('Emitted join-kitchen')
      }
      if (role === 'reception_master') {
        socket.emit('join-reception')
        console.log('Emitted join-reception')
      }
    }

    // If socket already connected emit immediately,
    // otherwise wait for connect event (race condition fix)
    if (socket.connected) {
      joinRoom()
    } else {
      socket.once('connect', joinRoom)
    }

    return () => {
      socket.off('connect', joinRoom)
    }
  }, [user])

  return null
}

export default SocketInitializer
