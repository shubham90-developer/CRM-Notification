'use client'

import React, { useEffect, useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetMenuMasterByIdQuery, useUpdateMenuMaterByIdMutation } from '@/store/menuMasterApi'
import { toast } from 'react-toastify'
import Image from 'next/image'

interface EditMenuMasterProps {
  item: {
    _id: string
  }
}

const EditMenuMaster = ({ item }: EditMenuMasterProps) => {
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    itemName: '',
    image: '',
    desc: '',
    priority: '',
    qty: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState('')

  // api
  const { data: menuMasterData, isLoading } = useGetMenuMasterByIdQuery(item._id)
  const [updateMenuMaster, { isLoading: isUpdating }] = useUpdateMenuMaterByIdMutation()

  useEffect(() => {
    if (!menuMasterData) return

    setFormData({
      itemName: menuMasterData?.itemName || '',
      image: menuMasterData?.image || '',
      desc: menuMasterData?.desc || '',
      priority: menuMasterData?.priority || '',
      qty: menuMasterData?.qty || '',
    })

    setPreviewImage(menuMasterData?.image || '')
  }, [menuMasterData])

  // handlechange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      }
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = new FormData()

      data.append('itemName', formData.itemName)
      data.append('desc', formData.desc)
      data.append('priority', formData.priority)
      data.append('qty', formData.qty)

      if (image) {
        data.append('image', image)
      }

      await updateMenuMaster({
        id: item._id,
        data,
      }).unwrap()

      toast.success('Menu updated successfully')
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }
  return (
    <>
      <button type="button" className="btn btn-soft-primary btn-sm" onClick={() => setOpen(true)}>
        <IconifyIcon width={16} height={16} className="me-1" icon="solar:pen-2-broken" />
      </button>

      {open && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={() => setOpen(false)} />
      )}

      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow"
        style={{
          width: window.innerWidth < 576 ? '100%' : '400px',
          zIndex: 1050,
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Edit Menu</h5>
          <button type="button" className="btn-close" onClick={() => setOpen(false)} />
        </div>

        <div className="p-3 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* item name */}
                <div className="col-md-12">
                  <label className="form-label">🍛 Item Name</label>
                  <input type="text" className="form-control" placeholder="" name="itemName" onChange={handleChange} value={formData.itemName} />
                </div>

                {/* item image */}
                <div className="col-md-12">
                  <label className="form-label">📸 Item Image</label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]

                      if (file) {
                        setImage(file)
                        setPreviewImage(URL.createObjectURL(file))
                      }
                    }}
                  />

                  {previewImage && (
                    <div className="mt-3 text-center">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        className="img-fluid rounded border"
                        width={200}
                        height={200}
                        style={{
                          width: '50%',
                          maxHeight: '100px',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/*  Desc */}
                <div className="col-md-12">
                  <label className="form-label"> 👨‍🍳 Desc</label>
                  <textarea name="desc" rows={5} className="form-control" onChange={handleChange} value={formData.desc} />{' '}
                </div>

                {/* item Priority */}
                <div className="col-md-12">
                  <label className="form-label">🚨 Priority</label>
                  <select name="priority" className="form-select" onChange={handleChange} value={formData.priority} required>
                    <option value="">📌 Select Priority</option>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="critical">🚨 Critical</option>
                  </select>
                </div>

                {/* item qty */}
                <div className="col-md-12">
                  <label className="form-label">Item QTY</label>
                  <input type="text" className="form-control" placeholder="" name="qty" onChange={handleChange} value={formData.qty} />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary w-100 mt-3">
                Update
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default EditMenuMaster
