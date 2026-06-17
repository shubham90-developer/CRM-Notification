import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Reciptionist from './Components/Reciptionist'

export const metadata: Metadata = { title: 'Reciptionist ' }

const ReciptionistPage = () => {
  return (
    <>
      <PageTItle title="Reciptionist " />
      <Reciptionist />
    </>
  )
}

export default ReciptionistPage
