import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicles, getVehicleByLicensePlate } from '../../api/vehicleApi';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import { setVehicles, setLoading, setSelectedVehicle, setDetailLoading } from '../../store/vehicleSlice';

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
  const dispatch = useDispatch();
  const { list, loading, selectedVehicle, detailLoading } = useSelector(state => state.vehicle);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const res = await getVehicles();
        if (res.success) {
          dispatch(setVehicles(res.data.map(item => ({ ...item, key: item._id }))));
        }
      } catch (err) {
        // handle error
      }
      dispatch(setLoading(false));
    };
    fetchData();
  }, [dispatch]);

  const handleRowClick = async (record) => {
    dispatch(setDetailLoading(true));
    try {
      const res = await getVehicleByLicensePlate(record.licensePlate);
      if (res.success) {
        dispatch(setSelectedVehicle(res.data));
        setDialogOpen(true);
      }
    } catch (err) {
      // handle error
    }
    dispatch(setDetailLoading(false));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    dispatch(setSelectedVehicle(null));
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={false}
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
      />
      <VehicleDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        vehicle={selectedVehicle}
        loading={detailLoading}
      />
    </>
  );
};

export default VehicleTable;
