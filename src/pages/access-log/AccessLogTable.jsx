import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Space, Row, Col, Button, DatePicker, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAccessLogById } from '../../api/accessLogApi';
import AccessLogDetailsDialog from './AccessLogDetailsDialog';
import useDebounce from '../../hooks/useDebounce';
import { 
  fetchAccessLogs, 
  setSearch, 
  setStatus, 
  setGateId, 
  setAction, 
  setStartDate, 
  setEndDate, 
  setPagination, 
  setSelectedAccessLog, 
  setDetailLoading,
  clearFilters 
} from '../../store/accessLogSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AccessLogTable = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    loading, 
    selectedAccessLog, 
    detailLoading, 
    pagination, 
    search: storeSearch, 
    status: storeStatus, 
    gateId: storeGateId, 
    action: storeAction,
    startDate: storeStartDate,
    endDate: storeEndDate
  } = useSelector(state => state.accessLog);

  const [dialogOpen, setDialogOpen] = useState(false);

  // Local UI state for controlled inputs
  const [search, setSearchLocal] = useState(storeSearch || '');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatusLocal] = useState(storeStatus || '');
  const [gateId, setGateIdLocal] = useState(storeGateId || '');
  const [action, setActionLocal] = useState(storeAction || '');
  const [dateRange, setDateRange] = useState([
    storeStartDate ? dayjs(storeStartDate) : null,
    storeEndDate ? dayjs(storeEndDate) : null
  ]);

  // Columns definition
  const columns = [
    { 
      title: 'Biển số', 
      dataIndex: 'licensePlate', 
      key: 'licensePlate',
      render: (text) => <strong>{text}</strong>
    },
    { 
      title: 'Chủ xe', 
      dataIndex: ['owner', 'name'], 
      key: 'owner',
      render: (text, record) => record.owner?.name || record.guestInfo?.name || 'N/A'
    },
    { 
      title: 'Loại xe', 
      dataIndex: ['vehicle', 'vehicleType'], 
      key: 'vehicleType',
      render: (text, record) => {
        const type = record.vehicle?.vehicleType;
        return type === 'car' ? 'Xe ô tô' : type === 'motorbike' ? 'Xe máy' : type || 'N/A';
      }
    },
    { 
      title: 'Màu xe', 
      dataIndex: ['vehicle', 'color'], 
      key: 'color',
      render: (text, record) => record.vehicle?.color || 'N/A'
    },
    { 
      title: 'Trạng thái đăng ký', 
      dataIndex: 'isVehicleRegistered', 
      key: 'isVehicleRegistered',
      render: (registered) => (
        <Tag color={registered ? 'green' : 'red'}>
          {registered ? 'Đã đăng ký' : 'Chưa đăng ký'}
        </Tag>
      )
    },
    { 
      title: 'Thời gian phát hiện', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    { 
      title: 'Hành động', 
      dataIndex: 'action', 
      key: 'action',
      render: (action) => (
        <Tag color={action === 'entry' ? 'blue' : 'orange'}>
          {action === 'entry' ? 'Vào' : 'Ra'}
        </Tag>
      )
    },
    { 
      title: 'Cổng', 
      dataIndex: 'gateName', 
      key: 'gateName'
    },
    { 
      title: 'Trạng thái xác minh', 
      dataIndex: 'verificationStatus', 
      key: 'verificationStatus',
      render: (status) => {
        const colors = {
          pending: 'gold',
          approved: 'green',
          auto_approved: 'red'
        };
        const labels = {
          pending: 'Chờ xác minh',
          approved: 'Đã xác minh',
          auto_approved: 'Tự động xác minh'
        };
        return (
          <Tag color={colors[status] || 'default'}>
            {labels[status] || status}
          </Tag>
        );
      }
    }
  ];

  // fetch on mount and when filters/pagination change
  useEffect(() => {
    const params = {
      search: debouncedSearch || undefined,
      status: status || undefined,
      gateId: gateId || undefined,
      action: action || undefined,
      startDate: storeStartDate || undefined,
      endDate: storeEndDate || undefined,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    dispatch(fetchAccessLogs(params));
  }, [
    dispatch, 
    debouncedSearch, 
    status, 
    gateId, 
    action, 
    storeStartDate, 
    storeEndDate, 
    pagination.current, 
    pagination.pageSize
  ]);

  const handleRowClick = async (record) => {
    dispatch(setDetailLoading(true));
    try {
      const res = await getAccessLogById(record._id);
      if (res.success) {
        dispatch(setSelectedAccessLog(res.data));
        setDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching access log details:', err);
    }
    dispatch(setDetailLoading(false));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    dispatch(setSelectedAccessLog(null));
  };

  const onSearchChange = (e) => {
    setSearchLocal(e.target.value);
  };

  // keep Redux search in sync when debounced value changes
  useEffect(() => {
    dispatch(setSearch(debouncedSearch || ''));
  }, [debouncedSearch, dispatch]);

  const onStatusChange = (val) => {
    setStatusLocal(val);
    dispatch(setStatus(val));
  };

  const onGateIdChange = (val) => {
    setGateIdLocal(val);
    dispatch(setGateId(val));
  };

  const onActionChange = (val) => {
    setActionLocal(val);
    dispatch(setAction(val));
  };

  const onDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      dispatch(setStartDate(dates[0].format('YYYY-MM-DD')));
      dispatch(setEndDate(dates[1].format('YYYY-MM-DD')));
    } else {
      dispatch(setStartDate(''));
      dispatch(setEndDate(''));
    }
  };

  const handleTableChange = (pag) => {
    dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
  };

  const handleResetFilters = () => {
    setSearchLocal('');
    setStatusLocal('');
    setGateIdLocal('');
    setActionLocal('');
    setDateRange([null, null]);
    dispatch(clearFilters());
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input.Search
            placeholder="Tìm biển số, chủ xe..."
            allowClear
            enterButton
            value={search}
            onChange={onSearchChange}
            onSearch={(value) => { setSearchLocal(value); }}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select 
            value={status} 
            onChange={onStatusChange} 
            style={{ width: '100%' }} 
            allowClear 
            placeholder="Trạng thái xác minh"
          >
            <Option value="pending">Chờ xác minh</Option>
            <Option value="verified">Đã xác minh</Option>
            <Option value="rejected">Từ chối</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select 
            value={action} 
            onChange={onActionChange} 
            style={{ width: '100%' }} 
            allowClear 
            placeholder="Hành động"
          >
            <Option value="entry">Vào</Option>
            <Option value="exit">Ra</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select 
            value={gateId} 
            onChange={onGateIdChange} 
            style={{ width: '100%' }} 
            allowClear 
            placeholder="Cổng"
          >
            <Option value="GATE_001">Cổng chính</Option>
            <Option value="GATE_002">Cổng phụ</Option>
            {/* Add more gates as needed */}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            style={{ width: '100%' }}
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleResetFilters}>
              Reset
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
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} bản ghi`,
        }}
        onChange={handleTableChange}
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
        scroll={{ x: 1200 }}
      />

      <AccessLogDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        accessLog={selectedAccessLog}
        loading={detailLoading}
      />
    </>
  );
};

export default AccessLogTable;
