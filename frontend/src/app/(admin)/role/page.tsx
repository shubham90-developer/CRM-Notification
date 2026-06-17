import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AllRoles from './components/AllRoles'

export const metadata: Metadata = { title: 'All Roles & Permissions' }

const RolePage = () => {
  return (
    <>
      <PageTItle title="All Roles & Permissions" />
      <AllRoles />
    </>
  )
}

export default RolePage
