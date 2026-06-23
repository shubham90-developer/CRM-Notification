'use client'

import avatar1 from '@/assets/images/users/avatar-1.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { logout } from '@/store/authSlice'
import { useRouter } from 'next/navigation'

const ProfileDropdown = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    // Clears token from localStorage, cookie, and Redux state
    dispatch(logout())
    router.replace('/auth/sign-in')
  }

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          <Image className="rounded-circle" width={32} height={32} src="/logo.png" alt="avatar-3" />
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownHeader as={'h6'} className="dropdown-header">
          Welcome To Shree Ganesh!
        </DropdownHeader>

        <div className="dropdown-divider my-1" />

        <DropdownItem onClick={handleLogout} className="text-danger" style={{ cursor: 'pointer' }}>
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
