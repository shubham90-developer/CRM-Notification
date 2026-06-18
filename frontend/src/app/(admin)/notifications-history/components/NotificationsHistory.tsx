'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import product from '../../../../assets/images/products/i1.jpg'
import React from 'react'
import { Badge, Card, CardTitle, Col, Row } from 'react-bootstrap'

import Image from 'next/image'
import { useGetMenuMasterQuery } from '@/store/menuMasterApi'
const NotificationsHistory = () => {
  const { data: menuList = [], isLoading } = useGetMenuMasterQuery()
  if (isLoading) return <div className="text-center p-5">Loading...</div>
  return (
    <>
      <Row>
        <Col xl={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Header */}
            <div className="d-flex card-header bg-white justify-content-between align-items-center py-3 border-bottom">
              <div>
                <CardTitle as={'h4'} className="mb-0 fw-bold">
                  🔔 All Notification
                </CardTitle>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light">
                  <tr>
                    <th className="text-nowrap">#</th>
                    <th className="text-nowrap">🍛 Item Name</th>
                    <th className="text-nowrap">📸 Image</th>
                    <th className="text-nowrap">💰 Price</th>
                    <th className="text-nowrap">⚖️ QTY</th>
                    <th className="text-nowrap">📌 Status</th>
                    <th className="text-nowrap text-center"> 📅 Date</th>
                  </tr>
                </thead>

                <tbody>
                  {menuList.map((item, index) => (
                    <tr key={item._id}>
                      <td>
                        <span className="fw-semibold">{index + 1}</span>
                      </td>
                      <td>
                        <h6 className="mb-0 fw-semibold">{item.itemName}</h6>
                      </td>
                      <td>
                        <Image
                          src={item.image || '/no-img.png'}
                          alt={item.itemName}
                          width={70}
                          height={70}
                          className="img-fluid object-fit-cover rounded-3"
                        />
                      </td>
                      <td>
                        <span className="fw-bold text-success">{item.qty}</span>
                      </td>
                      <td>
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
                          className="px-3 py-2 rounded-pill">
                          {item.status}
                        </Badge>
                      </td>
                      <td>
                        <span className="fw-semibold">{item.createdAt}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default NotificationsHistory
