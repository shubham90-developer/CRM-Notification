import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MenuMaster from './components/MenuMaster'

export const metadata: Metadata = { title: 'menu Master' }

const MenuMasterPage = () => {
  return (
    <>
      <PageTItle title="menu Master" />
      <MenuMaster />
    </>
  )
}

export default MenuMasterPage
