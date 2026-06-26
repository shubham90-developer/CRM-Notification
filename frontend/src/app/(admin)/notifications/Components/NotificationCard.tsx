'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import product from '../../../../assets/images/no-img.png'
import { useGetMenuMasterByIdQuery, useUpdateMenuStatusMutation } from '@/store/menuMasterApi'
import { useGetSettingsQuery } from '@/store/settingApi'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { removeNotification, updateNotificationStatus } from '@/store/notificationSlice'

// CHANGED: accepts id + onDismiss prop instead of item/searchParams
const NotificationCard = ({ id }: { id: string }) => {
  const dispatch = useDispatch()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data: menuData, isLoading, isError, refetch } = useGetMenuMasterByIdQuery(id, { skip: !id })
  const { data: settings } = useGetSettingsQuery()
  const [updateMenuStatus] = useUpdateMenuStatusMutation()

  const [status, setStatus] = useState(menuData?.status || 'pending')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const audioStopped = useRef(false)

  // Reset audio flag when id changes
  useEffect(() => {
    audioStopped.current = false
  }, [id])

  // Play audio on new data
  useEffect(() => {
    if (!menuData || !audioRef.current || audioStopped.current) return
    audioRef.current.volume = 0.5
    audioRef.current.play().catch(() => {
      setTimeout(() => {
        audioRef.current?.play().catch(() => console.log('Audio blocked'))
      }, 500)
    })
  }, [menuData])

  // Sync status from API
  useEffect(() => {
    if (menuData?.status) setStatus(menuData.status)
  }, [menuData?.status])

  // Elapsed timer
  const getElapsed = () => {
    if (!menuData?.bellStartedAt) return 0
    const start = new Date(menuData.bellStartedAt).getTime()
    const end = menuData?.readyAt ? new Date(menuData.readyAt).getTime() : Date.now()
    return Math.max(0, Math.floor((end - start) / 1000))
  }

  const [elapsedSeconds, setElapsedSeconds] = useState(getElapsed)

  useEffect(() => {
    setElapsedSeconds(getElapsed())
    if (!menuData?.bellStartedAt || menuData?.readyAt) return
    const interval = setInterval(() => setElapsedSeconds(getElapsed()), 1000)
    return () => clearInterval(interval)
  }, [menuData?.bellStartedAt, menuData?.readyAt])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const stopAudio = () => {
    audioStopped.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioEnabled(false)
  }

  const handleSeen = async () => {
    try {
      stopAudio()
      await updateMenuStatus({ id, status: 'seen' }).unwrap()
      setStatus('seen')
      dispatch(updateNotificationStatus({ id, status: 'seen' }))
      toast.success('Marked as Seen')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handlePrepare = async () => {
    try {
      stopAudio()
      await updateMenuStatus({ id, status: 'prepare' }).unwrap()
      setStatus('prepare')
      dispatch(updateNotificationStatus({ id, status: 'prepare' }))
      toast.success('Marked as Preparing')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleReady = async () => {
    try {
      stopAudio()
      await updateMenuStatus({ id, status: 'ready' }).unwrap()
      dispatch(removeNotification(id)) // CHANGED: removes card from Redux instead of local dismissed state
      toast.success('Order marked as Ready!')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const audioSrc = settings?.notificationAudio || ''

  if (isLoading) return <div className="food-card text-center p-5">Loading...</div>
  if (isError || !menuData) return null // CHANGED: don't show card if error, just remove silently

  return (
    <>
      <audio ref={audioRef} loop>
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      {/* CARD — exact same JSX as before, no style changes */}
      <div className="food-card">
        <div className="d-flex align-items-center gap-3 mb-2">
          <button className="btn btn-light">
            <span className="tag timer-tag">⏱ {formatTime(elapsedSeconds)}</span>
          </button>
        </div>
        <div className="text-center mb-3">
          <h5 className="mb-0 fw-bold small">{menuData?.itemName}</h5>
        </div>
        <div className="image-box">
          <Image src={menuData?.image || product} alt={menuData?.itemName || 'food'} width={120} height={100} className="food-image rounded-1" />
        </div>
        <div className="tags">
          <span className="tag green">🥗 {menuData?.qty}</span>
          <span
            className={`tag text-white ${menuData?.priority === 'critical' || menuData?.priority === 'urgent' ? 'bg-danger' : menuData?.priority === 'high' ? 'bg-warning text-dark' : 'bg-info'}`}>
            🚨 {menuData?.priority}
          </span>
          <span
            className={`tag text-white fs-6 px-3 py-2 ${status === 'ready' ? 'bg-success' : status === 'prepare' ? 'bg-warning text-dark' : status === 'seen' ? 'bg-info' : 'bg-secondary'}`}>
            👁️ {status}
          </span>
        </div>
        <div className="text-center">
          <p className="text-muted small mb-3">{menuData?.desc || 'No description available'}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          <button type="button" disabled={status !== 'pending'} onClick={handleSeen} className="btn btn-primary d-flex align-items-center gap-1">
            <IconifyIcon icon="solar:eye-bold" />
            {status === 'seen' || status === 'prepare' || status === 'ready' ? 'Seen ✓' : 'Seen'}
          </button>
          <button type="button" disabled={status !== 'seen'} onClick={handlePrepare} className="btn btn-warning d-flex align-items-center gap-1">
            <IconifyIcon icon="solar:chef-hat-bold" />
            {status === 'prepare' || status === 'ready' ? 'Preparing ✓' : 'Prepare'}
          </button>
          <button type="button" disabled={status !== 'prepare'} onClick={handleReady} className="btn btn-success d-flex align-items-center gap-1">
            <IconifyIcon icon="solar:check-circle-bold" />
            {status === 'ready' ? 'Ready ✓' : 'Mark Ready'}
          </button>
        </div>
      </div>

      {/* STYLES — exact same as before, no changes */}
      <style jsx>{`
        .food-card {
          width: 360px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-radius: 32px;
          padding: 24px;
          position: relative;
          z-index: 5;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.08);
          animation: floatCard 4s ease-in-out infinite;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .image-box {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .food-image {
          object-fit: contain;
          animation: vibrate 1.5s infinite ease-in-out;
        }
        @keyframes vibrate {
          0% {
            transform: translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateX(-2px) rotate(-1deg);
          }
          50% {
            transform: translateX(2px) rotate(1deg);
          }
          75% {
            transform: translateX(-2px) rotate(-1deg);
          }
          100% {
            transform: translateX(0px) rotate(0deg);
          }
        }
        .tags {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .tag {
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
        }
        .green {
          background: #e9ffd9;
          color: #2f8f2f;
        }
      `}</style>
    </>
  )
}

export default NotificationCard
