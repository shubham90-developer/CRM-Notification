import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import NotificationsHistory from './components/NotificationsHistory'

export const metadata: Metadata = { title: 'Notifications History' }

const NotificationsHistoryPage = () => {
  return (
    <>
      <PageTItle title="Notifications History" />
      <NotificationsHistory />
    </>
  )
}

export default NotificationsHistoryPage
