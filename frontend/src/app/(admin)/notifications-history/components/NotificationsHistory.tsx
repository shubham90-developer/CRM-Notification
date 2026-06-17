'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import product from '../../../../assets/images/products/i1.jpg'
import React from 'react'
import { Badge, Card, CardTitle, Col, Row } from 'react-bootstrap'

import Image from 'next/image'

const data = [
  {
    id: 1,
    itemName: 'Shabu Khichadi',
    image: product,
    price: '200',
    qty: '20kg',
    status: 'Seen',
    date: '29 may 2026',
  },
]

const NotificationsHistory = () => {
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
                  {data.map((item, index) => (
                    <tr key={item.id}>
                      {/* Sr No */}
                      <td>
                        <span className="fw-semibold">{index + 1}</span>
                      </td>

                      {/* Item Name */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div>
                            <h6 className="mb-0 fw-semibold">{item.itemName}</h6>
                          </div>
                        </div>
                      </td>

                      {/* Image */}
                      <td>
                        <div className="border rounded-3 overflow-hidden d-inline-block">
                          <Image src={item.image} alt={item.itemName} width={70} height={70} className="img-fluid object-fit-cover" />
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="fw-bold text-success">₹ {item.price}</span>
                      </td>

                      {/* Qty */}
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <IconifyIcon icon="solar:box-bold-duotone" className="fs-18 text-warning" />
                          <span>{item.qty}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge bg={item.status === 'Seen' ? 'success' : 'danger'} className="px-3 py-2 rounded-pill">
                          <IconifyIcon
                            icon={item.status === 'Seen' ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                            className="me-1"
                          />
                          {item.status}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="fw-semibold">{item.date}</span>
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
