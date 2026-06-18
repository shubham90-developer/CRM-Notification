'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { addNotification, clearAll, markAllRead } from '@/store/notificationSlice'
import socket from '@/lib/socket'

const Notifications = () => {
  const dispatch = useDispatch()
  const { items, unreadCount } = useSelector((state: RootState) => state.notifications)

  useEffect(() => {
    socket.on('new-menu-notification', (data) => {
      dispatch(addNotification(data))
    })
    return () => {
      socket.off('new-menu-notification')
    }
  }, [dispatch])

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button position-relative content-none"
        id="page-header-notifications-dropdown"
        onClick={() => dispatch(markAllRead())}>
        <IconifyIcon icon="solar:bell-bing-bold-duotone" className="fs-24 align-middle" />
        {unreadCount > 0 && (
          <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
            {unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </DropdownToggle>
      <DropdownMenu className="py-0 dropdown-lg dropdown-menu-end">
        <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
          <Row className="align-items-center">
            <div className="col">
              <h6 className="m-0 fs-16 fw-semibold">Notifications</h6>
            </div>
            <div className="col-auto">
              <span onClick={() => dispatch(clearAll())} className="text-dark text-decoration-underline" style={{ cursor: 'pointer' }}>
                <small>Clear All</small>
              </span>
            </div>
          </Row>
        </div>
        <SimplebarReactClient style={{ maxHeight: 280 }}>
          {items.length === 0 ? (
            <div className="text-center py-4 text-muted">No notifications</div>
          ) : (
            items.map((n) => (
              <DropdownItem key={n._id} className="py-3 border-bottom text-wrap">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <div className="avatar-sm me-2">
                      <span className="avatar-title bg-soft-info text-info fs-20 rounded-circle">{n.itemName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-semibold">{n.itemName}</p>
                    <p className="mb-0 text-muted small">
                      Priority: {n.priority} | Qty: {n.qty}
                    </p>
                  </div>
                </div>
              </DropdownItem>
            ))
          )}
        </SimplebarReactClient>
        <div className="text-center py-3">
          <Link href="/notifications-history" className="btn btn-primary btn-sm">
            View All Notifications <i className="bx bx-right-arrow-alt ms-1" />
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default Notifications
