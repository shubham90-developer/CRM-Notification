'use client'
import { useTitle } from '@/context/useTitleContext'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const ROLE_TITLES: Record<string, string> = {
  kitchen_master: 'Kitchen Master',
  reception_master: 'Reception Master',
}

const TopBarTitle = () => {
  const { title } = useTitle()
  const user = useSelector((state: RootState) => state.auth.user)
  const role = user?.role?.toLowerCase()

  const displayTitle = role && ROLE_TITLES[role] ? ROLE_TITLES[role] : title

  return (
    <div className="topbar-item">
      <h4 className="fw-bold topbar-button pe-none text-uppercase mb-0">{displayTitle}</h4>
    </div>
  )
}

export default TopBarTitle
