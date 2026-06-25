'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useEffect, useRef, useState } from 'react'
import { Badge, Card, CardBody, CardFooter, CardTitle, Col, Row } from 'react-bootstrap'

import Image from 'next/image'
import { IMenuMaster, useDeleteMenuMasterByIdMutation, useGetMenuMasterQuery, useUpdateMenuStatusMutation } from '@/store/menuMasterApi'
import { useGetSettingsQuery } from '@/store/settingApi'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import defaultImg from '../../../../assets/images/no-img.png'
import { useRouter } from 'next/navigation'
import socket from '@/lib/socket'

// ── Shared time formatter ─────────────────────────────────────────────────────
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ── Single card — its own component so the timer hook isn't inside a .map() ──
interface MenuMasterCardProps {
  item: IMenuMaster
  onNotify: (item: IMenuMaster) => void
  onDelete: (id: string) => void
  onSeen: (item: IMenuMaster) => void
}

const MenuMasterCard = ({ item, onNotify, onDelete, onSeen }: MenuMasterCardProps) => {
  const isThisItemReady = item.status === 'ready'

  // ── Inline timer logic ──────────────────────────────────────────────────
  // Starts ticking when bellStartedAt is set (bell clicked), freezes when
  // readyAt is set (kitchen marked it ready). Driven by real timestamps,
  // not a client-only counter, so it survives refresh and stays in sync
  // with the Kitchen Master card via socket-triggered refetches.
  const getElapsed = () => {
    if (!item.bellStartedAt) return 0
    const start = new Date(item.bellStartedAt).getTime()
    const end = item.readyAt ? new Date(item.readyAt).getTime() : Date.now()
    return Math.max(0, Math.floor((end - start) / 1000))
  }

  const [elapsedSeconds, setElapsedSeconds] = useState(getElapsed)

  useEffect(() => {
    setElapsedSeconds(getElapsed())

    // Not started yet, or already finished — don't run a ticking interval
    if (!item.bellStartedAt || item.readyAt) return

    const interval = setInterval(() => {
      setElapsedSeconds(getElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [item.bellStartedAt, item.readyAt])
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div className={`card border-0 shadow-sm h-100 rounded-4 overflow-hidden menu-card ${isThisItemReady ? 'ready-card-glow' : ''}`}>
        {/* Image */}
        <div className="position-relative">
          {item.image ? (
            <Image
              src={item.image || '/images/no-image.png'}
              alt={item.itemName}
              width={500}
              height={250}
              className="w-100"
              style={{ height: '120px', objectFit: 'fill' }}
            />
          ) : (
            <Image src={defaultImg} alt="no img" width={500} height={150} className="w-100" style={{ height: '120px', objectFit: 'contain' }} />
          )}

          {/* Priority badge */}
          <span
            className={`badge position-absolute top-0 end-0 m-3 px-3 py-1 ${
              item.priority === 'critical'
                ? 'bg-danger'
                : item.priority === 'high'
                  ? 'bg-warning text-dark'
                  : item.priority === 'medium'
                    ? 'bg-info'
                    : 'bg-success'
            }`}>
            {item.priority}
          </span>

          {/* Ready ribbon */}
          {isThisItemReady && <div className="ready-ribbon">✅ READY</div>}
        </div>

        {/* Card body */}
        <div className="card-body p-2 d-flex flex-column">
          <div className="mb-2">
            <h4 className="fw-bold mb-0 pt-2 pb-1 text-truncate">{item.itemName}</h4>
          </div>

          <p className="text-muted small mb-2">{item.desc.slice(0, 100) || 'No description available'}</p>

          <hr className="my-0 opacity-25" />

          {/* Qty + Timer + Status */}
          <div className="d-flex justify-content-between align-items-center py-1">
            <div className="d-flex align-items-center gap-2">
              <IconifyIcon icon="solar:box-bold-duotone" className="text-warning fs-5" />
              <span className="fw-semibold small">Qty: {item.qty}</span>
            </div>
            <div>
              <Badge className="fw-semibold bg-light text-dark font-bold medium d-flex align-items-center justify-content-center gap-1 rounded-pill px-2 py-2">
                <IconifyIcon icon="solar:clock-circle-bold" className="text-secondary" />
                {formatTime(elapsedSeconds)}
              </Badge>
            </div>
            {item.status ? (
              <Badge
                bg={item.status === 'ready' ? 'success' : item.status === 'prepare' ? 'warning' : item.status === 'seen' ? 'info' : 'secondary'}
                className="rounded-pill px-2 py-2 text-capitalize">
                {item.status}
              </Badge>
            ) : (
              <Badge bg="secondary" className="rounded-pill px-4 py-2 text-capitalize">
                Status
              </Badge>
            )}
          </div>

          <hr className="my-0 opacity-25" />

          {/* Actions */}
          <div className="mt-auto d-flex gap-2">
            {item.status === 'ready' ? (
              <button className="btn flex-fill position-relative btn-soft-primary" onClick={() => onNotify(item)}>
                <span className="preparing-badge" style={{ background: '#0d6efd' }}>
                  RESEND
                </span>
                <IconifyIcon icon="solar:refresh-bold-duotone" className="fs-5" />
              </button>
            ) : (
              <button
                className={`btn flex-fill position-relative ${item.status === 'prepare' ? 'bell-btn-preparing' : 'btn-soft-success'}`}
                onClick={() => onNotify(item)}>
                {item.status === 'prepare' && <span className="preparing-badge">PREPARING</span>}
                <IconifyIcon icon="solar:bell-bold-duotone" className={`fs-5 ${item.status === 'prepare' ? 'bell-blink' : ''}`} />
              </button>
            )}

            <button
              type="button"
              disabled={item.status !== 'ready'}
              onClick={() => onSeen(item)}
              className={`btn flex-fill d-flex align-items-center justify-content-center gap-1 ${
                item.status === 'ready' ? 'btn-secondary' : isThisItemReady ? 'btn-success seen-pulse' : 'btn-outline-secondary'
              }`}>
              <IconifyIcon icon="solar:eye-bold" />
              {item.status === 'seen' ? 'Seen ✓' : 'Seen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main list component ───────────────────────────────────────────────────────
const MenuMaster = () => {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  // ── Audio refs & state ─────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioStopped = useRef(false)
  // Tracks which item _id triggered the ready audio — so Seen only stops
  // audio for that specific item, not unrelated ones
  const [readyItemId, setReadyItemId] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const { data: settings } = useGetSettingsQuery()

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 8
    const width = window.innerWidth
    if (width >= 1400) return 12
    if (width >= 1200) return 9
    if (width >= 768) return 6
    return 4
  }

  const itemPerPage = getItemsPerPage()
  const [visibleCount, setVisibleCount] = React.useState(itemPerPage)

  const { data: menuMaster = [], isLoading, isError, refetch } = useGetMenuMasterQuery()

  React.useEffect(() => {
    const handleResize = () => setVisibleCount(getItemsPerPage())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [deleteMenuMaster] = useDeleteMenuMasterByIdMutation()
  const [updateMenuStatus] = useUpdateMenuStatusMutation()

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchMenuMaster = menuMaster.filter((item: IMenuMaster) => item.itemName.toLowerCase().includes(search.toLowerCase()))

  // ── Reload audio element when settings URL changes ─────────────────────────
  useEffect(() => {
    if (audioRef.current && settings?.notificationAudio) {
      audioRef.current.load()
    }
  }, [settings?.notificationAudio])

  // ── Socket listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    // menu-list-updated fires on every status change with { _id, status }
    socket.on('menu-list-updated', (data: { _id: string; status: string }) => {
      refetch()

      // Only react to "ready" status
      if (data?.status === 'ready') {
        audioStopped.current = false
        setReadyItemId(data._id)

        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.volume = 0.6
          audioRef.current
            .play()
            .then(() => setAudioPlaying(true))
            .catch(() => {
              // Browser autoplay policy — retry once after 500ms
              setTimeout(() => {
                if (!audioStopped.current) {
                  audioRef.current
                    ?.play()
                    .then(() => setAudioPlaying(true))
                    .catch(() => console.log('Audio blocked by browser'))
                }
              }, 500)
            })
        }
      }
    })

    return () => {
      socket.off('menu-list-updated')
    }
  }, [refetch])

  // ── Stop audio (shared helper) ─────────────────────────────────────────────
  const stopAudio = () => {
    audioStopped.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioPlaying(false)
    setReadyItemId(null)
  }

  // ── Seen handler — stops audio + marks item seen in DB ────────────────────
  const handleSeen = async (item: IMenuMaster) => {
    // Stop audio immediately (sync) before any async work
    stopAudio()

    try {
      toast.success(`👁 ${item.itemName} marked as Seen`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  const currentItems = searchMenuMaster.slice(0, visibleCount)
  const hasMore = visibleCount < searchMenuMaster.length

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this Menu?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      await deleteMenuMaster(id).unwrap()
      toast.success('Menu deleted successfully')
    } catch {
      toast.error('Something went wrong')
    }
  }

  // ── Send notification to Kitchen / Reception ───────────────────────────────
  const handleNotification = async (item: IMenuMaster) => {
    try {
      await updateMenuStatus({ id: item._id, status: 'pending' }).unwrap()
    } catch {
      toast.error('Failed to reset order status')
      return
    }

    socket.emit('menu-master-notify', {
      _id: item._id,
      itemName: item.itemName,
      image: item.image,
      priority: item.priority,
      qty: item.qty,
      desc: item.desc,
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>

  return (
    <>
      {/* Hidden audio — same notification sound from Settings */}
      <audio ref={audioRef} loop>
        <source src={settings?.notificationAudio || ''} type="audio/mpeg" />
      </audio>

      {/* ── Ready audio banner — visible only while audio is playing ────────── */}
      {audioPlaying && readyItemId && (
        <div className="ready-alert-banner mb-3">
          <div className="ready-alert-left">
            <div className="ready-pulse-dot" />
            <div>
              <p className="ready-alert-title">✅ Order is Ready!</p>
              <p className="ready-alert-sub">
                <strong>{menuMaster.find((m: IMenuMaster) => m._id === readyItemId)?.itemName || 'Order'}</strong> तयार आहे! खालील कार्डवर{' '}
                <strong>Seen</strong> क्लिक करा व ऑडिओ थांबवा.
              </p>
            </div>
          </div>
        </div>
      )}

      <Row>
        <Col xl={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Header */}
            <div className="d-flex card-header bg-white justify-content-between align-items-center py-3 border-bottom">
              <div>
                <CardTitle as={'h4'} className="mb-0 fw-bold">
                  🍽️ All Menu Master List
                </CardTitle>
              </div>
              <div className="d-flex gap-2 align-items-center">
                {/* Search */}
                <div className="position-relative ms-2 d-none d-md-block">
                  <input
                    type="search"
                    className="form-control form-control-sm ps-4"
                    placeholder="Search..."
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <IconifyIcon icon="solar:magnifer-linear" className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                </div>
                {/* <AddMenuMaster /> */}
              </div>
            </div>

            <CardBody>
              <div className="row g-4">
                {currentItems?.length > 0 ? (
                  currentItems.map((item: IMenuMaster) => (
                    <MenuMasterCard key={item._id} item={item} onNotify={handleNotification} onDelete={handleDelete} onSeen={handleSeen} />
                  ))
                ) : (
                  <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body text-center py-5">
                        <IconifyIcon icon="solar:box-minimalistic-broken" className="fs-1 text-muted" />
                        <h5 className="mt-3">No Menu Found</h5>
                        <p className="text-muted mb-0">There are no menu items available.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>

            {hasMore && (
              <CardFooter className="border-top text-center">
                <button className="btn btn-outline-primary px-4" onClick={() => setVisibleCount((prev) => prev + itemPerPage)}>
                  Load More
                </button>
              </CardFooter>
            )}
          </Card>
        </Col>
      </Row>

      <style>{`
        /* ── Existing ───────────────────────────────────────────────────────── */
        @keyframes bellRing {
          0%   { transform: rotate(0deg); }
          10%  { transform: rotate(18deg); }
          20%  { transform: rotate(-16deg); }
          30%  { transform: rotate(14deg); }
          40%  { transform: rotate(-10deg); }
          50%  { transform: rotate(6deg); }
          60%  { transform: rotate(-4deg); }
          70%  { transform: rotate(2deg); }
          80%  { transform: rotate(-1deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(255, 140, 0, 0); }
        }

        @keyframes badgePop {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -50%) scale(1.3); }
        }

        .bell-blink {
          animation: bellRing 1s ease-in-out infinite;
          transform-origin: top center;
          color: #ff8c00;
          filter: drop-shadow(0 0 4px rgba(255,140,0,0.8));
        }

        .bell-btn-preparing {
          animation: pulseGlow 1.5s ease-in-out infinite;
          background: linear-gradient(135deg, #fff3e0, #ffe0b2) !important;
          border: 1.5px solid #ff8c00 !important;
        }

        .preparing-badge {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff8c00;
          color: white;
          font-size: 8px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 20px;
          white-space: nowrap;
          animation: badgePop 1s ease-in-out infinite;
          letter-spacing: 0.3px;
        }

        /* ── Ready card glow ────────────────────────────────────────────────── */
        @keyframes readyGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.45); }
          50%       { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
        }

        .ready-card-glow {
          animation: readyGlow 2s ease-in-out infinite;
          border: 1.5px solid #28a745 !important;
        }

        /* ── Ready ribbon on image ──────────────────────────────────────────── */
        .ready-ribbon {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(40, 167, 69, 0.88);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-align: center;
          padding: 3px 0;
        }

        /* ── Seen button pulse when item is ready ───────────────────────────── */
        @keyframes seenPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.55); }
          50%       { box-shadow: 0 0 0 7px rgba(40, 167, 69, 0); }
        }

        .seen-pulse {
          animation: seenPulse 1.2s ease-in-out infinite;
        }

        /* ── Alert banner ───────────────────────────────────────────────────── */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.5; }
        }

        .ready-alert-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          border: 1.5px solid #28a745;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(40, 167, 69, 0.18);
          animation: slideDown 0.3s ease;
        }

        .ready-alert-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ready-pulse-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #28a745;
          flex-shrink: 0;
          animation: pulseDot 1.2s ease-in-out infinite;
        }

        .ready-alert-title {
          margin: 0;
          font-weight: 700;
          color: #155724;
          font-size: 15px;
        }

        .ready-alert-sub {
          margin: 2px 0 0;
          font-size: 13px;
          color: #155724;
        }
      `}</style>
    </>
  )
}

export default MenuMaster
