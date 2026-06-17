import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Notifications from './Components/Notifications'

export const metadata: Metadata = { title: 'Notifications ' }

const NotificationsPage = () => {
  return (
    <>
      <PageTItle title="Notifications " />
      <Notifications />
    </>
  )
}

export default NotificationsPage
