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

const Reciptionist = ({ item }: any) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // APIs
  const { data: menuData, isLoading, isError } = useGetMenuMasterByIdQuery(id!, { skip: !id })
  const { data: settings } = useGetSettingsQuery()
  const [updateMenuStatus] = useUpdateMenuStatusMutation()

  const data = menuData || item
  const [status, setStatus] = useState(data?.status || 'pending')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  // Join reception room and listen for new notifications
  useEffect(() => {
    socket.on('menu-status-updated', (data) => {
      if (data._id === id) {
        setStatus(data.status)
      }

      toast.info(`🔔 New Order: ${data.itemName}`)
      router.push(`/reciptionist?id=${data._id}`)
    })
    return () => {
      socket.off('new-menu-notification')
      socket.off('new-menu-notification')
      socket.off('menu-status-updated')
    }
  }, [])

  useEffect(() => {
    if (data && audioRef.current && audioUnlocked) {
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(() => console.log('Audio blocked'))
    }
  }, [data, audioUnlocked])

  // Sync status from API data
  useEffect(() => {
    if (data?.status) setStatus(data.status)
  }, [data?.status])

  // ✅ FIX 3: handler to unlock audio on first tap
  const handleUnlockAudio = () => {
    setAudioUnlocked(true)
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioEnabled(false)
  }

  const handleReady = async () => {
    if (!id) return
    try {
      await updateMenuStatus({ id, status: 'ready' }).unwrap()
      setStatus('ready')
      stopAudio()
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
      {data ? (
        <div className="modern-page">
          {/* ✅ FIX 4: Tap-to-unlock overlay — shown until user taps it.
              router.push() is programmatic (no user gesture), so browser blocks
              autoplay. This overlay forces a tap which counts as a user gesture,
              allowing audio to play after. */}
          {!audioUnlocked && (
            <div
              onClick={handleUnlockAudio}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.78)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexDirection: 'column',
                color: '#fff',
                textAlign: 'center',
              }}>
              <div style={{ fontSize: '64px' }}>🔔</div>
              <h3 style={{ marginTop: '16px', fontWeight: 700 }}>New Order Arrived!</h3>
              <p style={{ opacity: 0.8, marginTop: '8px' }}>Tap anywhere to enable notification sound</p>
            </div>
          )}

          {/* AUDIO */}
          <audio ref={audioRef} loop>
            <source src={audioSrc} type="audio/mpeg" />
          </audio>

          {/* BACKGROUND WAVES */}
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>

          {/* SOUND BARS */}
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
            <div className="d-flex align-items-center gap-3 mb-4">
              <button className="back-btn" onClick={() => router.back()}>
                <IconifyIcon icon="solar:arrow-left-linear" />
              </button>
              <h4 className="mb-0 fw-bold">{data?.itemName}</h4>
              <span className="badge bg-info ms-auto">Reception</span>
            </div>

            {/* IMAGE */}
            <div className="image-box">
              <Image src={data?.image || product} alt={data?.itemName || 'food'} width={220} height={150} className="food-image rounded-1" />
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
            </div>

            <div className="text-center">
              <p className="text-muted small mb-3">{data?.desc || 'No description available'}</p>
            </div>

            {/* STATUS BADGE */}
            <div className="text-center mb-3">
              <span
                className={`badge fs-6 px-3 py-2 ${
                  status === 'ready' ? 'bg-success' : status === 'prepare' ? 'bg-warning text-dark' : status === 'seen' ? 'bg-info' : 'bg-secondary'
                }`}>
                Status: {status}
              </span>
            </div>

            {/* ONLY "Ready" BUTTON for Reception */}
            <div className="d-flex justify-content-center">
              <button
                type="button"
                disabled={status === 'ready' || status === 'pending' || status === 'seen'}
                onClick={handleReady}
                className="btn btn-success btn-lg d-flex align-items-center gap-2 px-5">
                <IconifyIcon icon="solar:check-circle-bold" />
                {status === 'ready' ? 'Ready ✓' : 'Mark as Ready'}
              </button>
            </div>

            {status === 'pending' || status === 'seen' ? (
              <p className="text-center text-muted small mt-3">⏳ Waiting for Kitchen to start preparing...</p>
            ) : null}
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
              background: rgba(80, 200, 255, 0.12);
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
              background: #5bc8f5;
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
              border: 1px solid rgba(255, 255, 255, 0.6);
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
          <h4 className="fw-bold">No Notification</h4>
          <p className="text-muted mb-0">No menu data available.</p>
        </div>
      )}
    </>
  )
}

export default Reciptionist
