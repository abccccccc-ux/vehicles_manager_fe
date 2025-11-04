import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Space, Row, Col, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicleByLicensePlate } from '../../api/vehicleApi';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import useDebounce from '../../hooks/useDebounce';
import { fetchVehicles, setSearch, setVehicleType, setStatus, setPagination, setSelectedVehicle, setDetailLoading } from '../../store/vehicleSlice';

const columns = [
  { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
  { title: 'Tên xe', dataIndex: 'name', key: 'name' },
  { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
  { title: 'Màu', dataIndex: 'color', key: 'color' },
  { title: 'Chủ xe', dataIndex: ['owner', 'name'], key: 'owner' },
  { title: 'Ngày đăng ký', dataIndex: 'registrationDate', key: 'registrationDate', render: (date) => new Date(date).toLocaleString('vi-VN') },
  { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: (active) => active ? 'Hoạt động' : 'Ngừng' },
];


const { Option } = Select;

const VehicleTable = () => {
  const dispatch = useDispatch();
  const { list, loading, selectedVehicle, detailLoading, pagination, search: storeSearch, vehicleType: storeVehicleType, status: storeStatus } = useSelector(state => state.vehicle);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Local UI state for controlled inputs
  const [search, setSearchLocal] = useState(storeSearch || '');
  const debouncedSearch = useDebounce(search, 400);
  const [vehicleType, setVehicleTypeLocal] = useState(storeVehicleType || '');
  const [status, setStatusLocal] = useState(storeStatus || '');

  // fetch on mount and when filters/pagination change
  useEffect(() => {
    const params = {
      search: debouncedSearch || undefined,
      vehicleType: vehicleType || undefined,
      status: status || undefined,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    dispatch(fetchVehicles(params));
  }, [dispatch, debouncedSearch, vehicleType, status, pagination.current, pagination.pageSize]);

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

  const onSearchChange = (e) => {
    setSearchLocal(e.target.value);
    // we update store search only when debounced value changes via effect below
  };

  // keep Redux search in sync when debounced value changes
  useEffect(() => {
    dispatch(setSearch(debouncedSearch || ''));
    // when search changes we reset to first page in slice via reducer side-effect
    dispatch(setPagination({ current: 1 }));
  }, [debouncedSearch, dispatch]);

  const onVehicleTypeChange = (val) => {
    setVehicleTypeLocal(val);
    dispatch(setVehicleType(val));
    dispatch(setPagination({ current: 1 }));
  };

  const onStatusChange = (val) => {
    setStatusLocal(val);
    dispatch(setStatus(val));
    dispatch(setPagination({ current: 1 }));
  };

  const handleTableChange = (pag) => {
    dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={10} lg={8}>
          <Input.Search
            placeholder="Tìm biển số, tên, chủ xe..."
            allowClear
            enterButton
            value={search}
            onChange={onSearchChange}
            onSearch={(value) => { setSearchLocal(value); }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select value={vehicleType} onChange={onVehicleTypeChange} style={{ width: '100%' }} allowClear placeholder="Loại xe">
            <Option value="car">Xe ô tô</Option>
            <Option value="motorbike">Xe máy</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select value={status} onChange={onStatusChange} style={{ width: '100%' }} allowClear placeholder="Trạng thái">
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Ngừng</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={24} lg={4} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => { setSearchLocal(''); setVehicleTypeLocal(''); setStatusLocal(''); dispatch(setSearch('')); dispatch(setVehicleType('')); dispatch(setStatus('')); dispatch(setPagination({ current: 1 })); }}>
              Reset
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
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
