'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import product from '../../../../assets/images/no-img.png'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGetMenuMasterByIdQuery, useUpdateMenuStatusMutation } from '@/store/menuMasterApi'
import { useGetSettingsQuery } from '@/store/settingApi'
import { toast } from 'react-toastify'
import socket from '@/lib/socket'

const Notifications = ({ item }: any) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // APIs
  const { data: menuData, isLoading, isError, refetch } = useGetMenuMasterByIdQuery(id!, { skip: !id })
  const { data: settings } = useGetSettingsQuery()
  const [updateMenuStatus] = useUpdateMenuStatusMutation()
  const [notifyKey, setNotifyKey] = useState(0)
  const data = menuData || item
  const [status, setStatus] = useState(data?.status || 'pending')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  // FIX 1: ref to permanently track that user stopped audio
  // Unlike state, ref value survives re-renders caused by RTK Query refetch
  const audioStopped = useRef(false)

  useEffect(() => {
    audioStopped.current = false
  }, [id])

  useEffect(() => {
    audioStopped.current = false
    setDismissed(false)
  }, [id, notifyKey])

  useEffect(() => {
    socket.emit('join-kitchen')

    socket.on('new-menu-notification', (data) => {
      toast.info(`🔔 New Order: ${data.itemName}`)
      router.push(`/notifications?id=${data._id}`)
      setNotifyKey((k) => k + 1)

      if (data._id === id) {
        refetch()
      }
    })

    return () => {
      socket.off('new-menu-notification')
    }
  }, [id, refetch])

  useEffect(() => {
    if (!data || !audioRef.current || audioStopped.current) return
    audioRef.current.volume = 0.5
    audioRef.current.play().catch(() => {
      setTimeout(() => {
        audioRef.current?.play().catch(() => console.log('Audio blocked'))
      }, 500)
    })
  }, [data, notifyKey])

  // Sync status from API data
  useEffect(() => {
    if (data?.status) setStatus(data.status)
  }, [data?.status])

  // ── Elapsed timer — starts from bellStartedAt, freezes at readyAt ─────────
  const getElapsed = () => {
    if (!data?.bellStartedAt) return 0
    const start = new Date(data.bellStartedAt).getTime()
    const end = data?.readyAt ? new Date(data.readyAt).getTime() : Date.now()
    return Math.max(0, Math.floor((end - start) / 1000))
  }

  const [elapsedSeconds, setElapsedSeconds] = useState(getElapsed)

  useEffect(() => {
    setElapsedSeconds(getElapsed())

    if (!data?.bellStartedAt || data?.readyAt) return // not started, or already stopped

    const interval = setInterval(() => {
      setElapsedSeconds(getElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [data?.bellStartedAt, data?.readyAt])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  // FIX 3: set audioStopped.current = true BEFORE pausing
  const stopAudio = () => {
    audioStopped.current = true // blocks useEffect from restarting audio after refetch
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioEnabled(false)
  }

  // FIX 4: call stopAudio() BEFORE await so it runs synchronously
  // before RTK Query refetch can re-trigger the audio useEffect
  const handleSeen = async () => {
    if (!id) return
    try {
      stopAudio() // ← FIRST, before any async operation
      await updateMenuStatus({ id, status: 'seen' }).unwrap()
      setStatus('seen')
      toast.success('Marked as Seen')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handlePrepare = async () => {
    if (!id) return
    try {
      stopAudio()
      await updateMenuStatus({ id, status: 'prepare' }).unwrap()
      setStatus('prepare')
      toast.success('Marked as Preparing')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleReady = async () => {
    if (!id) return
    try {
      stopAudio()
      await updateMenuStatus({ id, status: 'ready' }).unwrap()
      setStatus('ready')
      setDismissed(true)
      toast.success('Order marked as Ready!')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const audioSrc = settings?.notificationAudio || ''

  if (isLoading) return <div className="text-center p-5">Loading...</div>
  if (isError) return <div className="text-center p-5 text-danger">Error loading menu</div>

  return (
    <>
      {data && !dismissed ? (
        <div className="modern-page">
          {/* AUDIO — uses URL from settings */}
          <audio ref={audioRef} loop>
            <source src={audioSrc} type="audio/mpeg" />
          </audio>

          {/* BACKGROUND WAVES */}
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>

          {/* SOUND BARS (visible while audio is enabled) */}
          {audioEnabled && (
            <div className="voice-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          {/* CARD */}
          <div className="food-card">
            {/* HEADER */}
            <div className="d-flex align-items-center gap-3 mb-2">
              <button className="btn btn-light" onClick={() => router.back()}>
                {/* <IconifyIcon icon="solar:arrow-left-linear" /> */}
                <span className="tag timer-tag ">⏱ {formatTime(elapsedSeconds)}</span>
              </button>
            </div>
            <div className="text-center mb-3">
              {' '}
              <h5 className="mb-0 fw-bold small">{data?.itemName}</h5>
            </div>
            {/* IMAGE */}
            <div className="image-box">
              <Image src={data?.image || product} alt={data?.itemName || 'food'} width={120} height={100} className="food-image rounded-1" />
            </div>

            {/* TAGS */}
            <div className="tags">
              <span className="tag green">🥗 {data?.qty}</span>
              <span
                className={`tag text-white ${
                  data?.priority === 'critical' || data?.priority === 'urgent'
                    ? 'bg-danger'
                    : data?.priority === 'high'
                      ? 'bg-warning text-dark'
                      : 'bg-info'
                }`}>
                🚨 {data?.priority}
              </span>
              <span
                className={`tag text-white  fs-6 px-3 py-2 ${
                  status === 'ready' ? 'bg-success' : status === 'prepare' ? 'bg-warning text-dark' : status === 'seen' ? 'bg-info' : 'bg-secondary'
                }`}>
                👁️ {status}
              </span>
            </div>

            <div className="text-center">
              <p className="text-muted small mb-3">{data?.desc || 'No description available'}</p>
            </div>

            {/* STATUS BADGE */}
            <div className="text-center mb-3"></div>
            {/* TIMER
            <div className="text-center mb-3">
              <span className="badge bg-dark fs-6 px-3 py-2">⏱ {formatTime(elapsedSeconds)}</span>
            </div> */}

            {/* BUTTONS — only Seen and Prepare for Kitchen Master */}
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
            .voice-bars {
              position: absolute;
              top: 90px;
              display: flex;
              align-items: flex-end;
              gap: 6px;
              z-index: 3;
            }
            .voice-bars span {
              width: 8px;
              border-radius: 20px;
              background: #b8e05d;
              animation: voice 1s infinite ease-in-out;
            }
            .voice-bars span:nth-child(1) {
              height: 20px;
              animation-delay: 0s;
            }
            .voice-bars span:nth-child(2) {
              height: 35px;
              animation-delay: 0.2s;
            }
            .voice-bars span:nth-child(3) {
              height: 50px;
              animation-delay: 0.4s;
            }
            .voice-bars span:nth-child(4) {
              height: 35px;
              animation-delay: 0.6s;
            }
            .voice-bars span:nth-child(5) {
              height: 20px;
              animation-delay: 0.8s;
            }
            @keyframes voice {
              0%,
              100% {
                transform: scaleY(0.5);
                opacity: 0.5;
              }
              50% {
                transform: scaleY(1.4);
                opacity: 1;
              }
            }
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
            .back-btn {
              width: 46px;
              height: 46px;
              border-radius: 16px;
              border: none;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              cursor: pointer;
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
        </div>
      ) : (
        <div className="text-center py-5">
          <IconifyIcon icon="solar:bell-bing-bold-duotone" className="fs-1 text-muted mb-3" />
          <h4 className="fw-bold">Notification Not Found</h4>
          <p className="text-muted mb-0">No menu data available. Go back and click a menu notification.</p>
        </div>
      )}
    </>
  )
}

export default Notifications
