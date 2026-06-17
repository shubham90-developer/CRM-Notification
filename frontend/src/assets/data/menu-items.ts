import { MenuItemType } from '@/types/menu'

// All possible menu items — sidebar filtering happens in AppMenu based on role
export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'Master',
    label: 'Master',
    isTitle: true,
    roles: ['menu_master'],
  },
  {
    key: 'menu-category',
    label: 'Menu Master',
    icon: 'solar:checklist-minimalistic-bold-duotone',
    url: '/menu-category',
    roles: ['menu_master'],
  },
  {
    key: 'kitchen-section',
    label: 'Kitchen',
    isTitle: true,
    roles: ['kitchen_master'],
  },
  {
    key: 'notifications',
    label: 'Kitchen Master',
    icon: 'solar:chef-hat-bold-duotone',
    url: '/notifications',
    roles: ['kitchen_master'],
  },
  {
    key: 'reception-section',
    label: 'Reception',
    isTitle: true,
    roles: ['reception_master'],
  },
  {
    key: 'reciptionist',
    label: 'Reception Master',
    icon: 'solar:user-id-bold-duotone',
    url: '/reciptionist',
    roles: ['reception_master'],
  },
  {
    key: 'Settings',
    label: 'Settings',
    isTitle: true,
    roles: ['menu_master'],
  },
  {
    key: 'general-settings',
    label: 'General Settings',
    icon: 'mdi:settings',
    url: '/settings',
    roles: ['menu_master'],
  },
]
