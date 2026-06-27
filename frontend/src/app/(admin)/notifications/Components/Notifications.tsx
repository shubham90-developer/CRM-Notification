'use client'

import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import NotificationCard from './NotificationCard'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetSettingsQuery } from '@/store/settingApi'

const Notifications = () => {
  // Read active notification IDs from Redux (already populated by SocketInitializer)
  const notifications = useSelector((state: RootState) => state.notifications.items)

  // Filter only pending/seen/prepare — not ready (ready ones are already removed by removeNotification)
  const activeNotifs = notifications.filter((n) => n.status !== 'ready')

  // Single shared audio instance for all notification cards
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data: settings } = useGetSettingsQuery()
  const audioSrc = settings?.notificationAudio || ''

  // ADD this
  const activeStatuses = activeNotifs.map((n) => n.status).join(',')
  const allAcknowledged = activeNotifs.length === 0 || activeNotifs.every((n) => n.status === 'seen' || n.status === 'prepare')

  useEffect(() => {
    if (!audioRef.current || activeNotifs.length === 0) return

    if (allAcknowledged) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } else {
      if (audioRef.current.paused) {
        audioRef.current.volume = 0.5
        audioRef.current.play().catch(() => {})
      }
    }
  }, [activeStatuses, activeNotifs.length])

  if (activeNotifs.length === 0) {
    return (
      <div className="text-center py-5">
        <IconifyIcon icon="solar:bell-bing-bold-duotone" className="fs-1 text-muted mb-3" />
        <h4 className="fw-bold">No Active Notifications</h4>
        <p className="text-muted mb-0">Waiting for new orders...</p>
      </div>
    )
  }

  return (
    <div className="modern-page">
      {/* Single shared audio element for all cards */}
      <audio ref={audioRef} loop>
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      {/* Background waves — one set for whole page */}
      <div className="wave wave1" />
      <div className="wave wave2" />
      <div className="wave wave3" />

      {/* Cards row — wraps automatically based on screen width */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          zIndex: 5,
          position: 'relative',
          padding: '20px',
        }}>
        {activeNotifs.map((notif) => (
          <NotificationCard key={notif._id} id={notif._id} />
        ))}
      </div>

      <style jsx>{`
        .modern-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          overflow: hidden;
          position: relative;
          padding: 20px;
        }
        .wave {
          position: absolute;
          border-radius: 50%;
          background: rgba(175, 255, 80, 0.15);
          animation: pulse 6s infinite;
        }
        .wave1 {
          width: 400px;
          height: 400px;
          animation-delay: 0s;
        }
        .wave2 {
          width: 550px;
          height: 550px;
          animation-delay: 1s;
        }
        .wave3 {
          width: 700px;
          height: 700px;
          animation-delay: 2s;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Notifications
