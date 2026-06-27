'use client'
import React, { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-toastify'
import { useCreateMenuMasterMutation } from '@/store/menuMasterApi'
import { useRouter } from 'next/navigation'
const AddMenuMaster = () => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    desc: '',
    priority: '',
    qty: '',
  })
  const [image, setImage] = useState<File | null>(null)
  // api
  const [createMenuMaster, { isLoading }] = useCreateMenuMasterMutation()
  const router = useRouter()
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!image) {
      toast.error('Please select an image')
      return
    }

    try {
      const data = new FormData()

      data.append('itemName', formData.itemName)
      data.append('desc', formData.desc)
      data.append('priority', formData.priority)
      data.append('qty', formData.qty)
      data.append('image', image)

      await createMenuMaster(data).unwrap()

      toast.success('Menu Master added successfully')

      setFormData({
        itemName: '',
        desc: '',
        priority: '',
        qty: '',
      })

      setImage(null)
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  return (
    <>
      {/* BUTTON */}
      <button className="btn btn-sm btn-primary d-flex align-items-center" onClick={() => setOpen(true)}>
        <IconifyIcon width={16} height={16} className="me-1" icon="bx:plus" />
        Add Menu
      </button>
      <button className="btn btn-sm btn-primary d-flex align-items-center" onClick={() => router.push('/settings')}>
        <IconifyIcon width={16} height={16} className="me-1" icon="bx:cog" />
        Settings
      </button>

      {/* BACKDROP */}
      {open && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={() => setOpen(false)} />
      )}

      {/* DRAWER */}
      <div
        className={`position-fixed top-0 end-0 h-100 bg-white shadow ${open ? 'translate-show' : 'translate-hide'}`}
        style={{
          width: '400px',
          zIndex: 1050,
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Add menu</h5>
          <button className="btn-close bg-red text-white p-2" onClick={() => setOpen(false)} />
        </div>

        {/* BODY */}
        <div className="p-3 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
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
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0])
                    }
                  }}
                />{' '}
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
              Create
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default AddMenuMaster
