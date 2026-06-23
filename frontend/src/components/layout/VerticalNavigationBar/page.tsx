'use client'

import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { getMenuItems } from '@/helpers/Manu'
import { Suspense } from 'react'
import AppMenu from './components/AppMenu'
import HoverMenuToggle from './components/HoverMenuToggle'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const VerticalNavigationBarPage = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const role = user?.role?.toLowerCase()

  if (role === 'kitchen_master' || role === 'reception_master') return null

  const menuItems = getMenuItems()

  return (
    <div className="main-nav">
      <LogoBox />
      <HoverMenuToggle />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default VerticalNavigationBarPage
