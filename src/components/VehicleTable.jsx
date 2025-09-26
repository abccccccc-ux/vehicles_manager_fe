
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getVehicles, getVehicleByLicensePlate } from '../api/vehicleApi';
import VehicleDetailsDialog from './VehicleDetailsDialog';

const columns = [
  { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
  { title: 'Tên xe', dataIndex: 'name', key: 'name' },
  { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
  { title: 'Màu', dataIndex: 'color', key: 'color' },
  { title: 'Chủ xe', dataIndex: ['owner', 'name'], key: 'owner' },
  { title: 'Ngày đăng ký', dataIndex: 'registrationDate', key: 'registrationDate', render: (date) => new Date(date).toLocaleString('vi-VN') },
  { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: (active) => active ? 'Hoạt động' : 'Ngừng' },
];

const VehicleTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getVehicles();
        if (res.success) {
          setData(res.data.map(item => ({ ...item, key: item._id })));
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRowClick = async (record) => {
    setDialogLoading(true);
    try {
      const res = await getVehicleByLicensePlate(record.licensePlate);
      if (res.success) {
        setSelectedVehicle(res.data);
        setDialogOpen(true);
      }
    } catch (err) {
      // handle error
    }
    setDialogLoading(false);
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
      />
      <VehicleDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        vehicle={selectedVehicle}
        loading={dialogLoading}
      />
    </>
  );
};

export default VehicleTable;
