import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Space, Row, Col, Button, message, Modal } from 'antd';
import { CloudUploadOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicleById, deleteVehicle } from '../../api/vehicleApi';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import BulkUploadModal from './BulkUploadModal';
import AdminAddVehicleModal from './AdminAddVehicleModal';
import useDebounce from '../../hooks/useDebounce';
import { fetchVehicles, setSearch, setVehicleType, setStatus, setDepartmentId, setPagination, setSelectedVehicle, setDetailLoading } from '../../store/vehicleSlice';
import departmentApi from '../../api/departmentApi';
import { isHighLevelAdmin } from '../../utils/permissions';

const { Option } = Select;

const VehicleTable = () => {
  const dispatch = useDispatch();
  const { list, loading, selectedVehicle, detailLoading, pagination, search: storeSearch, vehicleType: storeVehicleType, status: storeStatus, departmentId: storeDepartmentId } = useSelector(state => state.vehicle);
  const { user } = useSelector(state => state.auth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);

  // Local UI state for controlled inputs
  const [search, setSearchLocal] = useState(storeSearch || '');
  const debouncedSearch = useDebounce(search, 400);
  const [vehicleType, setVehicleTypeLocal] = useState(storeVehicleType || '');
  const [status, setStatusLocal] = useState(storeStatus || '');
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentIdLocal] = useState(storeDepartmentId || undefined);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getDepartments();
        if (res.data?.success) {
          setDepartments(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    };
    fetchDepartments();
  }, []);

  // fetch on mount and when filters/pagination change
  useEffect(() => {
    const params = {
      search: debouncedSearch || undefined,
      vehicleType: vehicleType || undefined,
      isActive: status || undefined,
      departmentId: departmentId || undefined,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    dispatch(fetchVehicles(params));
  }, [dispatch, debouncedSearch, vehicleType, status, departmentId, pagination.current, pagination.pageSize]);

  const handleRowClick = async (record) => {
    dispatch(setDetailLoading(true));
    try {
      const res = await getVehicleById(record._id);
      if (res.success) {
        dispatch(setSelectedVehicle(res.data));
        setDialogOpen(true);
      }
    } catch (err) {
      message.error('Không thể tải thông tin xe');
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

  const onDepartmentChange = (val) => {
    setDepartmentIdLocal(val);
    dispatch(setDepartmentId(val));
    // Reset pagination to page 1
    dispatch(setPagination({ current: 1 }));
  };

  const handleTableChange = (pag) => {
    dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
  };

  const handleAddVehicleSuccess = () => {
    // Refresh danh sách xe sau khi thêm thành công
    const params = {
      search: debouncedSearch || undefined,
      vehicleType: vehicleType || undefined,
      isActive: status || undefined,
      departmentId: departmentId || undefined,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    dispatch(fetchVehicles(params));
  };

  const handleDeleteSuccess = () => {
    // Refresh danh sách xe sau khi xóa thành công
    const params = {
      search: debouncedSearch || undefined,
      vehicleType: vehicleType || undefined,
      isActive: status || undefined,
      departmentId: departmentId || undefined,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    dispatch(fetchVehicles(params));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa phương tiện',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa phương tiện "${record.licensePlate}" không? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await deleteVehicle(record._id);
          if (response.success) {
            message.success('Xóa phương tiện thành công');
            handleDeleteSuccess();
          } else {
            message.error(response.message || 'Xóa phương tiện thất bại');
          }
        } catch (error) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa phương tiện');
        }
      },
    });
  };

  const canDelete = user && isHighLevelAdmin(user.role);

  const columns = [
    { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
    { title: 'Tên xe', dataIndex: 'name', key: 'name' },
    { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
    { title: 'Màu', dataIndex: 'color', key: 'color' },
    { title: 'Chủ xe', dataIndex: ['owner', 'name'], key: 'owner' },
    {
      title: 'Đơn vị',
      key: 'department',
      render: (_, record) => record.owner?.department?.name || record.owner?.department || '—',
    },
    { title: 'Ngày đăng ký', dataIndex: 'registrationDate', key: 'registrationDate', render: (date) => new Date(date).toLocaleString('vi-VN') },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: (active) => active ? 'Hoạt động' : 'Ngừng' },
    ...(canDelete ? [{
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(record);
          }}
        >
        </Button>
      ),
    }] : []),
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={10} lg={6}>
          <Input.Search
            placeholder="Tìm biển số, tên, chủ xe..."
            allowClear
            enterButton
            value={search}
            onChange={onSearchChange}
            onSearch={(value) => { setSearchLocal(value); }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={3}>
          <Select onChange={onVehicleTypeChange} style={{ width: '100%' }} allowClear placeholder="Loại xe">
            <Option value="car">Xe ô tô</Option>
            <Option value="motorbike">Xe máy</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            onChange={onDepartmentChange}
            style={{ width: '100%' }}
            allowClear
            placeholder="Đơn vị"
            showSearch
            filterOption={(input, option) => {
              const searchText = input.toLowerCase();
              const name = String(option?.children || '').toLowerCase();
              const code = String(option?.code || '').toLowerCase();
              return name.includes(searchText) || code.includes(searchText);
            }}
          >
            {departments.map((dep) => (
              <Option key={dep._id} value={dep._id} code={dep.code}>
                {dep.name} - {dep.code}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select onChange={onStatusChange} style={{ width: '100%' }} allowClear placeholder="Trạng thái">
            <Option value="true">Hoạt động</Option>
            <Option value="false">Ngừng hoạt động</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={24} lg={4} style={{ textAlign: 'right' }}>
          <Space>
            {isAdmin && (
              <Button
                icon={<PlusOutlined />}
                onClick={() => setAddVehicleModalOpen(true)}
              >
                Thêm xe mới
              </Button>
            )}
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => setBulkUploadModalOpen(true)}
            >
              Nhập hàng loạt
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        bordered
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
        onDeleteSuccess={handleDeleteSuccess}
      />

      <BulkUploadModal
        open={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
      />

      <AdminAddVehicleModal
        open={addVehicleModalOpen}
        onClose={() => setAddVehicleModalOpen(false)}
        onSuccess={handleAddVehicleSuccess}
      />
    </>
  );
};

export default VehicleTable;
