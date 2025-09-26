import React from 'react';
import { Table } from 'antd';

const columns = [
  { title: 'Biển số', dataIndex: 'plate', key: 'plate' },
  { title: 'Thời gian vào', dataIndex: 'inTime', key: 'inTime' },
  { title: 'Thời gian ra', dataIndex: 'outTime', key: 'outTime' },
];

const data = [
  { key: 1, plate: '30A-12345', inTime: '08:00', outTime: '09:00' },
  { key: 2, plate: '29B-67890', inTime: '09:15', outTime: '10:00' },
];

const VehicleTable = () => <Table columns={columns} dataSource={data} pagination={false} />;

export default VehicleTable;
