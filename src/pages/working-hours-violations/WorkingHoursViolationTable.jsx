import { useEffect, useState } from 'react';
import { Table, Input, Select, Row, Col, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkingHoursViolationDetails } from '../../api/workingHoursViolationApi';
import WorkingHoursViolationDetailsDialog from './WorkingHoursViolationDetailsDialog';
import useDebounce from '../../hooks/useDebounce';
import { 
  fetchWorkingHoursViolations, 
  setSearch, 
  setViolationType,
  setStartDate, 
  setEndDate, 
  setPagination, 
  setSelectedViolation, 
  setDetailLoading} from '../../store/workingHoursViolationSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const WorkingHoursViolationTable = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    loading, 
    selectedViolation, 
    detailLoading, 
    pagination, 
    search: storeSearch, 
    violationType: storeViolationType,
    severity: storeSeverity,
    status: storeStatus, 
    startDate: storeStartDate,
    endDate: storeEndDate
  } = useSelector(state => state.workingHoursViolation);

  const [dialogOpen, setDialogOpen] = useState(false);

  // Local UI state for controlled inputs
  const [search, setSearchLocal] = useState(storeSearch || '');
  const debouncedSearch = useDebounce(search, 400);
  const [violationType, setViolationTypeLocal] = useState(storeViolationType || '');
  const [severity, setSeverityLocal] = useState(storeSeverity || '');
  const [status, setStatusLocal] = useState(storeStatus || '');
  
  // Khởi tạo dateRange với default 30 ngày gần đây nếu chưa có trong store
  const [dateRange, setDateRange] = useState(() => {
    if (storeStartDate && storeEndDate) {
      return [dayjs(storeStartDate), dayjs(storeEndDate)];
    }
    // Default: 30 ngày gần đây
    const today = dayjs();
    const thirtyDaysAgo = today.subtract(30, 'day');
    return [thirtyDaysAgo, today];
  });

  // Columns definition
  const columns = [
    { 
      title: 'Biển số', 
      dataIndex: 'licensePlate', 
      key: 'licensePlate',
      render: (text) => <strong>{text}</strong>
    },
    { 
      title: 'Chủ xe / Người điều khiển', 
      dataIndex: ['owner', 'name'], 
      key: 'owner',
      render: (text, record) => record.owner?.name || record.driver?.name || 'N/A'
    },
    { 
      title: 'Loại vi phạm', 
      dataIndex: 'violationType', 
      key: 'violationType',
      render: (type) => {
        const violationTypes = {
          'late_entry': 'Vào',
          'early_exit': 'Ra',
        };
        
        const violationType = violationTypes[type] || type || 'N/A';
        // const minutes = record.lateMinutes || record.earlyMinutes;
        
        return (
          <div>
            <div>{violationType}</div>
            {/* {minutes && <small style={{color: '#666'}}>{minutes} phút</small>} */}
          </div>
        );
      }
    },
    { 
      title: 'Thời gian vi phạm', 
      dataIndex: 'createdAt', // Sử dụng createdAt từ access log
      key: 'violationTime',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    { 
      title: 'Giờ cho phép', 
      dataIndex: 'allowedTime', 
      key: 'allowedTime',
      render: (allowedTime) => {
        if (allowedTime) {
          // Nếu allowedTime là giờ (HH:mm format)
          if (allowedTime.includes(':') && allowedTime.length <= 5) {
            return allowedTime;
          }
          // Nếu allowedTime là datetime
          return new Date(allowedTime).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        return 'N/A';
      }
    },
    { 
      title: 'Ghi chú', 
      dataIndex: 'notes', 
      key: 'notes',
      render: (notes, record) => {
        // Có thể sử dụng notes hoặc thông tin khác từ record
        return notes || record.reason || '-';
      }
    }
  ];

  // fetch on mount and when filters/pagination change
  useEffect(() => {
    // Tạo default dates nếu không có trong store
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const params = {
      search: debouncedSearch || undefined,
      violationType: violationType || undefined,
      status: status || undefined,
      startDate: storeStartDate || thirtyDaysAgo.toISOString().split('T')[0],
      endDate: storeEndDate || today.toISOString().split('T')[0],
      page: pagination.current,
      limit: pagination.pageSize,
    };
    dispatch(fetchWorkingHoursViolations(params));
  }, [
    dispatch, 
    debouncedSearch, 
    violationType,
    severity,
    status, 
    storeStartDate, 
    storeEndDate, 
    pagination.current, 
    pagination.pageSize
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = async (record) => {
    dispatch(setDetailLoading(true));
    try {
      const res = await getWorkingHoursViolationDetails(record._id);
      if (res.success) {
        dispatch(setSelectedViolation(res.data.log));
        setDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching violation details:', err);
    }
    dispatch(setDetailLoading(false));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    dispatch(setSelectedViolation(null));
  };

  const onSearchChange = (e) => {
    setSearchLocal(e.target.value);
  };

  // keep Redux search in sync when debounced value changes
  useEffect(() => {
    dispatch(setSearch(debouncedSearch || ''));
  }, [debouncedSearch, dispatch]);

  // Set default dates vào Redux store nếu chưa có
  useEffect(() => {
    if (!storeStartDate || !storeEndDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      if (!storeStartDate) {
        dispatch(setStartDate(thirtyDaysAgo.toISOString().split('T')[0]));
      }
      if (!storeEndDate) {
        dispatch(setEndDate(today.toISOString().split('T')[0]));
      }
    }
  }, [dispatch, storeStartDate, storeEndDate]);

  const onViolationTypeChange = (val) => {
    setViolationTypeLocal(val);
    dispatch(setViolationType(val));
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

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input.Search
            placeholder="Tìm biển số, tên..."
            allowClear
            enterButton
            value={search}
            onChange={onSearchChange}
            onSearch={(value) => { setSearchLocal(value); }}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select 
            value={violationType} 
            onChange={onViolationTypeChange} 
            style={{ width: '100%' }} 
            allowClear 
            placeholder="Loại vi phạm"
          >
            <Option value="late">Vào</Option>
            <Option value="early">Ra</Option>
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

      <WorkingHoursViolationDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        violation={selectedViolation}
        loading={detailLoading}
      />
    </>
  );
};

export default WorkingHoursViolationTable;
