'use client'

import logo from '@/assets/images/logo.png'
import authImg from '@/assets/images/auth.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import LoginFrom from './LoginFrom'
import { Col, Row } from 'react-bootstrap'
import Link from 'next/link'

const SignIn = () => {
  return (
    <div className="vh-100 overflow-hidden">
      <Row className="h-100 g-0">
        {/* LEFT SIDE (FORM) */}
        <Col lg={5} className="d-flex align-items-center justify-content-center bg-white p-4">
          <div style={{ maxWidth: '400px', width: '100%' }}>
            {/* LOGO */}
            <div className="mb-4 text-center">
              <Image src={logo} height={80} alt="logo" />
            </div>

            {/* TITLE */}
            <h3 className="fw-bold text-center">Welcome Back 👋</h3>
            <p className="text-muted text-center mb-4">Sign in to continue to your dashboard</p>

            {/* FORM */}
            <LoginFrom />
          </div>
        </Col>

        {/* RIGHT SIDE (IMAGE) */}
        <Col lg={7} className="d-none d-lg-block position-relative">
          <Image src={authImg} alt="auth" fill className="object-fit-cover" />

          {/* OVERLAY */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6))',
            }}
          />

          {/* TEXT */}
          <div className="position-absolute bottom-0 p-5 text-white">
            <h2 className="fw-bold text-white">Stay Updated with Smart Notifications 🔔</h2>

            <p className="mb-0">Send alerts, track updates, and keep everyone informed in real time.</p>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default SignIn
