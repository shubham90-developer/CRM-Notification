'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import AddRole from './AddRole'
import { useDeleteRoleMutation, useGetRoleQuery } from '@/store/roleApi'
import EditRole from './EditRole'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

const AllRoles = () => {
  const { data: allRole = [], isLoading, isError } = useGetRoleQuery()
  const [deleteRole] = useDeleteRoleMutation()

  // handle delete
  const handleDelete = async (_id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this Role?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return
    try {
      await deleteRole(_id).unwrap()
      toast.success('Role deleted successfully')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  if (isLoading) {
    return <div>Loading....</div>
  }

  if (isError) {
    return <div>Error</div>
  }
  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <div className="d-flex card-header justify-content-between align-items-center">
              <div>
                <CardTitle as={'h4'}>All Roles & Permissions List</CardTitle>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Add Button */}
                <AddRole />
              </div>
            </div>
            <div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th className="text-nowrap">Sr No.</th>
                      <th className="text-nowrap">Employee Name</th>
                      <th className="text-nowrap">Role</th>
                      <th className="text-nowrap">Email</th>
                      <th className="text-nowrap">Password</th>
                      <th className="text-nowrap">Permission</th>
                      <th className="text-nowrap">Action </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRole && allRole.length > 0 ? (
                      allRole.map((role, index) => (
                        <tr key={role._id}>
                          <td className="text-nowrap">
                            <span className="fw-medium">#{index + 1}</span>
                          </td>

                          <td className="text-nowrap">
                            <Link href="#" className="fw-medium">
                              {role.employeeName}
                            </Link>
                          </td>

                          <td className="text-nowrap">
                            <Link href="#" className="fw-medium">
                              {role.role}
                            </Link>
                          </td>

                          <td className="text-nowrap">{role.email}</td>

                          <td className="text-nowrap">{role.password}</td>

                          <td>
                            {role.permissions?.map((item, index) => (
                              <span key={index} className="fw-medium badge bg-info mx-1">
                                {item}
                              </span>
                            ))}
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <EditRole role={role} />

                              <button onClick={() => handleDelete(role._id)} className="btn btn-soft-danger btn-sm">
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={16} className="text-center py-4">
                          No Roles found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AllRoles
