'use client'

import React, { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useRouter } from 'next/navigation'
import { useCreateRoleMutation } from '@/store/roleApi'
import { toast } from 'react-toastify'

const permissionsList = [
  'Dashboard',
  'All Projects',
  'My Work',
  'Celender',
  'My Notes',
  'Core Team',
  'Project  Credentials',
  'Roles',
  'Collections',
  'Invoices',
  'Selltings',
]

const AddRole = () => {
  const [show, setShow] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [formData, setFormData] = useState<{
    employeeId: string
    employeeName: string
    role: string
    email: string
    password: string
    permissions: string[]
  }>({
    employeeId: '',
    employeeName: '',
    role: '',
    email: '',
    password: '',
    permissions: [],
  })
  // api
  const [createRole, isLoading] = useCreateRoleMutation()

  // toggle single checkbox
  const handleChange = (permission: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission)
      }

      return [...prev, permission]
    })
  }

  // select all
  const handleSelectAll = () => {
    if (selectedPermissions.length === permissionsList.length) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(permissionsList)
    }
  }

  // handleformChange
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      }
    })
  }

  // handle submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        permissions: selectedPermissions,
      }
      // @ts-ignore
      await createRole(payload).unwrap()

      toast.success('Role created successfully')

      // reset form
      setFormData({
        employeeId: '',
        employeeName: '',
        role: '',
        email: '',
        password: '',
        permissions: [],
      })

      setSelectedPermissions([])

      setShow(false)
    } catch (error) {
      toast.error('Something went wrong')
    }
  }
  console.log(formData)
  return (
    <>
      {/* BUTTON */}
      <button className="btn btn-sm btn-primary d-flex align-items-center" onClick={() => setShow(true)}>
        <IconifyIcon width={16} height={16} className="me-1" icon="bx:plus" />
        Add Role
      </button>

      {/* BACKDROP */}
      {show && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={() => setShow(false)} />
      )}

      {/* DRAWER */}
      <div
        className={`position-fixed top-0 end-0 h-100 bg-white shadow ${show ? 'translate-show' : 'translate-hide'}`}
        style={{
          width: '800px',
          zIndex: 1050,
          transition: 'transform 0.3s ease',
          transform: show ? 'translateX(0)' : 'translateX(100%)',
        }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Add Role & Permission</h5>
          <button className="btn-close bg-red text-white p-2" onClick={() => setShow(false)} />
        </div>

        {/* BODY */}
        <div className="p-3 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
          <form onSubmit={handleSubmit}>
            {/* Employee Name */}
            <div className="mb-3">
              <label className="form-label">Employee Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Name"
                name="employeeName"
                onChange={handleFormChange}
                value={formData.employeeName}
              />
            </div>

            <div className="row g-3">
              {/* Role */}
              <div className="col-md-4">
                <label className="form-label">Role</label>
                <input type="text" className="form-control" placeholder="Enter role" name="role" onChange={handleFormChange} value={formData.role} />
              </div>

              {/* email */}
              <div className="col-md-4">
                <label className="form-label">Email / Username</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email/username"
                  name="email"
                  onChange={handleFormChange}
                  value={formData.email}
                />
              </div>

              {/* password */}
              <div className="col-md-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  name="password"
                  onChange={handleFormChange}
                  value={formData.password}
                />
              </div>

              {/* permission */}
              {/* permission */}
              <div className="col-md-12">
                <label className="form-label fw-bold">Permission</label>

                {/* Select All */}
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="selectAll"
                    checked={selectedPermissions.length === permissionsList.length}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="form-check-label">
                    Select All
                  </label>
                </div>

                {/* Permission Grid */}
                <div className="row">
                  {permissionsList.map((permission, index) => (
                    <div className="col-md-3 col-6 mb-2" key={index}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`perm-${index}`}
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handleChange(permission)}
                        />
                        <label htmlFor={`perm-${index}`} className="form-check-label">
                          {permission}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary w-100 mt-5">
              Create Role
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default AddRole
