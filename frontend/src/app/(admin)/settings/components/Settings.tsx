'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/settingApi'
import { toast } from 'react-toastify'

const Settings = () => {
  const { data: settings, refetch } = useGetSettingsQuery()
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()

  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('')
  const audioInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (settings) {
      setUsername(settings.username || '')
      setAudioPreviewUrl(settings.notificationAudio || '')
    }
  }, [settings])

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    const formData = new FormData()
    if (username) formData.append('username', username)
    if (newPassword) {
      formData.append('changePassword', newPassword)
      formData.append('confirmPassword', confirmPassword)
    }
    try {
      await updateSettings(formData).unwrap()
      toast.success('General settings updated!')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to update settings')
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioFile(file)
    // Local preview before upload
    setAudioPreviewUrl(URL.createObjectURL(file))
  }

  const handleAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile) {
      toast.error('Please select an audio file first')
      return
    }
    const formData = new FormData()
    formData.append('notificationAudio', audioFile)
    try {
      await updateSettings(formData).unwrap()
      await refetch()
      toast.success('Notification audio uploaded!')
      setAudioFile(null)
      if (audioInputRef.current) audioInputRef.current.value = ''
    } catch {
      toast.error('Failed to upload audio')
    }
  }

  return (
    <>
      <Row>
        <Col lg={6}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>General Settings</CardTitle>
            </CardHeader>
            {/* <CardBody>
              <form onSubmit={handleGeneralSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </form>
            </CardBody> */}
          </Card>
        </Col>

        <Col lg={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>Notification Sound</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAudioSubmit}>
                <div className="mb-3">
                  <label className="form-label">Upload Notification Audio</label>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
                    className="form-control"
                    onChange={handleAudioChange}
                  />
                  <small className="text-muted">Supported: MP3, WAV, OGG — max 10MB</small>
                </div>

                {/* Preview — shows current saved audio or newly selected file */}
                {audioPreviewUrl && (
                  <div className="mb-3">
                    <label className="form-label">{audioFile ? 'Preview (not saved yet)' : 'Current Audio'}</label>
                    <audio controls className="w-100">
                      <source src={audioPreviewUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={isLoading || !audioFile}>
                  {isLoading ? 'Uploading...' : 'Upload & Save'}
                </button>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Settings
