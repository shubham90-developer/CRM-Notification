'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const getRoleRedirect = (role: string): string => {
  switch (role) {
    case 'menu_master':
      return '/menu-category'
    case 'kitchen_master':
      return '/notifications'
    case 'reception_master':
      return '/reciptionist'
    default:
      return '/menu-category'
  }
}

const getUserRole = (): string => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return ''
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || ''
  } catch {
    return ''
  }
}

const AuthProtectionWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')

    // Not logged in — send to sign-in
    if (!token && pathname !== '/auth/sign-in') {
      router.replace('/auth/sign-in')
      return
    }

    // Already logged in — send away from sign-in to correct home
    if (token && pathname === '/auth/sign-in') {
      const role = getUserRole()
      router.replace(getRoleRedirect(role))
      return
    }

    if (token) {
      const role = getUserRole()

      // Kitchen master should not access menu-category or settings
      if (role === 'kitchen_master' && (pathname === '/menu-category' || pathname === '/settings' || pathname === '/reciptionist')) {
        router.replace('/notifications')
        return
      }

      // Reception master should not access menu-category or settings or notifications
      if (role === 'Manager' && (pathname === '/menu-category' || pathname === '/settings' || pathname === '/notifications')) {
        router.replace('/reciptionist')
        return
      }

      // Menu master should not access kitchen or reception pages
      if (role === 'menu_master' && (pathname === '/notifications' || pathname === '/reciptionist')) {
        router.replace('/menu-category')
        return
      }
    }
  }, [pathname, router])

  return <>{children}</>
}

export default AuthProtectionWrapper
