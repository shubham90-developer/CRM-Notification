'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import product from '../../../../assets/images/products/i1.jpg'
import React from 'react'
import { Badge, Card, CardBody, CardFooter, CardTitle, Col, Row } from 'react-bootstrap'

import AddMenuMaster from './AddMenuMaster'
import EditMenuMaster from './EditMenuMaster'
import Image from 'next/image'
import { IMenuMaster, useDeleteMenuMasterByIdMutation, useGetMenuMasterQuery } from '@/store/menuMasterApi'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import defaultImg from '../../../../assets/images/no-img.png'
import { useRouter } from 'next/navigation'
import socket from '@/lib/socket'
import { useEffect } from 'react'
const MenuMaster = () => {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const itemPerPage = 10

  const { data: menuMaster = [], isLoading, isError, refetch } = useGetMenuMasterQuery()
  const [deleteMenuMaster] = useDeleteMenuMasterByIdMutation()

  // search
  const searchMenuMaster = menuMaster.filter((item: IMenuMaster) => {
    return item.itemName.toLowerCase().includes(search.toLowerCase())
  })
  useEffect(() => {
    socket.on('menu-list-updated', () => {
      refetch()
    })

    return () => {
      socket.off('menu-list-updated')
    }
  }, [refetch])

  // pagniation
  const startIndex = (page - 1) * itemPerPage
  const endIndex = startIndex + itemPerPage
  const currentItems = searchMenuMaster.slice(startIndex, endIndex)

  const totalPages = Math.ceil(searchMenuMaster.length / itemPerPage)

  // handle delete
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
      toast.success('Function deleted successfully')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  // pass data notification

  const handleNotification = (item: IMenuMaster) => {
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
                {/* SEARCH */}
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
                <AddMenuMaster />
              </div>
            </div>

            <CardBody>
              <div className="row g-4">
                {currentItems?.length > 0 ? (
                  currentItems.map((item: IMenuMaster, index: number) => (
                    <div key={item._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                      <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden menu-card">
                        {/* Image */}
                        <div className="position-relative">
                          {item.image ? (
                            <Image
                              src={item.image || '/images/no-image.png'}
                              alt={item.itemName}
                              width={500}
                              height={250}
                              className="w-100"
                              style={{
                                height: '120px',
                                objectFit: 'fill',
                              }}
                            />
                          ) : (
                            <Image
                              src={defaultImg}
                              alt={'no img'}
                              width={500}
                              height={150}
                              className="w-100"
                              style={{
                                height: '120px',
                                objectFit: 'contain',
                              }}
                            />
                          )}

                          {/* Priority */}
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
                        </div>

                        {/* Content */}
                        <div className="card-body p-2 d-flex flex-column">
                          {/* Title */}
                          <div className="mb-2">
                            <h4 className="fw-bold mb-0 pt-2 pb-1 text-truncate">{item.itemName}</h4>
                          </div>

                          {/* Description */}
                          <p className="text-muted small mb-2">{item.desc.slice(0, 100) || 'No description available'}</p>

                          {/* Divider */}
                          <hr className="my-0 opacity-25" />

                          {/* Qty + Status */}
                          <div className="d-flex justify-content-between align-items-center py-1">
                            <div className="d-flex align-items-center gap-1">
                              <IconifyIcon icon="solar:box-bold-duotone" className="text-warning fs-5" />
                              <span className="fw-semibold small">Qty: {item.qty}</span>
                            </div>
                            {item.status ? (
                              <Badge
                                bg={
                                  item.status === 'ready'
                                    ? 'success'
                                    : item.status === 'prepare'
                                      ? 'warning'
                                      : item.status === 'seen'
                                        ? 'info'
                                        : 'secondary'
                                }
                                className="rounded-pill px-2 py-2 text-capitalize">
                                {item.status}
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="rounded-pill px-4 py-2 text-capitalize">
                                Status
                              </Badge>
                            )}
                          </div>

                          {/* Divider */}
                          <hr className="my-0 opacity-25" />

                          {/* Actions */}
                          <div className="mt-auto d-flex gap-2">
                            <button className="btn btn-soft-success flex-fill" onClick={() => handleNotification(item)}>
                              <IconifyIcon icon="solar:bell-bold-duotone" className="fs-5" />
                            </button>

                            <EditMenuMaster item={item} />

                            <button className="btn btn-soft-danger flex-fill" onClick={() => handleDelete(item._id)}>
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="fs-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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

            <CardFooter className="border-top">
              <nav>
                <ul className="pagination justify-content-end mb-0">
                  {/* PREVIOUS */}
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button type="button" className="page-link" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                      Previous
                    </button>
                  </li>

                  {/* PAGE */}
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1

                    return (
                      <li key={pageNumber} className={`page-item ${page === pageNumber ? 'active' : ''}`}>
                        <button type="button" className="page-link" onClick={() => setPage(pageNumber)}>
                          {pageNumber}
                        </button>
                      </li>
                    )
                  })}

                  {/* NEXT */}
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button type="button" className="page-link" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default MenuMaster
