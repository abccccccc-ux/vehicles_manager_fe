import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Row, Col, Empty, Button } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import SearchFilter from '../../components/Search/SearchFilter';
import AlertMessage from '../../components/AlertMessage';
import showDeleteConfirm from '../../components/DeleteConfirm';
import { fetchWorkingHours, setIsActive, setPagination, deleteWorkingHours } from '../../store/workingHoursSlice';
import CreateWorkingHoursDialog from './CreateWorkingHoursDialog';
import UpdateWorkingHoursDialog from './UpdateWorkingHoursDialog';

const statusOptions = [
  { label: 'Hoạt động', value: true },
  { label: 'Ngừng hoạt động', value: false },
];
 
const statusTag = (isActive) => (isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>);

// Hàm chuyển đổi số ngày thành tên ngày
const getDayName = (dayNumber) => {
  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return dayNames[dayNumber] || dayNumber;
};

const columns = (onEdit, onDelete) => [
  { title: 'Tên', dataIndex: 'name', key: 'name' },
  { title: 'Thời gian', key: 'time', render: (_, record) => `${record.startTime} - ${record.endTime}` },
  { 
    title: 'Ngày làm', 
    dataIndex: 'workingDays', 
    key: 'workingDays', 
    render: (days) => days?.map(day => getDayName(day)).join(', ') 
  },
  { title: 'Trễ (phút)', dataIndex: 'lateToleranceMinutes', key: 'lateToleranceMinutes' },
  { title: 'Sớm (phút)', dataIndex: 'earlyToleranceMinutes', key: 'earlyToleranceMinutes' },
  { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: statusTag },
  {
    title: 'Hành động',
    key: 'actions',
    width: 120,
    align: 'center',
    render: (_, record) => (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Button type="text" icon={<EditOutlined />} onClick={() => onEdit && onEdit(record)} />
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete && onDelete(record)}
        />
      </div>
    ),
  },
];

const WorkingHoursList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedWorkingHour, setSelectedWorkingHour] = useState(null);
  const dispatch = useDispatch();
  const { list = [], loading, error, isActive, pagination, deleting, deleteResult, deleteError } = useSelector((state) => state.workingHours || {});

  useEffect(() => {
    dispatch(
      fetchWorkingHours({
        isActive,
        page: pagination?.current,
        limit: pagination?.pageSize,
      })
    );
  }, [dispatch, isActive, pagination?.current, pagination?.pageSize]);

  const handleTableChange = (pag) => {
    dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
  };

  const handleEdit = (record) => {
    setSelectedWorkingHour(record);
    setShowUpdateDialog(true);
  };

  const handleDelete = (record) => {
    showDeleteConfirm({
      message: `Bạn có chắc muốn xóa ca "${record.name}" không?`,
      onOk: async () => {
        const res = await dispatch(deleteWorkingHours(record._id || record.key));
        // res.payload may contain success/message
        if (res.payload && res.payload.success) {
          // refresh list by refetching current page
          dispatch(
            fetchWorkingHours({
              isActive,
              page: pagination?.current,
              limit: pagination?.pageSize,
            })
          );
        }
      },
    });
  };

  return (
    <Card
      title="Danh sách giờ làm việc"
      extra={
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateDialog(true)}>
            Thêm ca làm việc
          </Button>
        </div>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchFilter
            value={isActive}
            onChange={(val) => dispatch(setIsActive(val))}
            options={statusOptions}
            placeholder="Trạng thái"
          />
        </Col>
      </Row>

      {error && (
        <AlertMessage
          type="error"
          message={
            typeof error === 'string'
              ? error
              : error?.message || (error?.response?.data?.message ?? JSON.stringify(error))
          }
        />
      )}

      {list && list.length > 0 ? (
        <>
          {deleteResult && <AlertMessage type="success" message={deleteResult} />}
          {deleteError && <AlertMessage type="error" message={deleteError} />}
          <Table
            rowKey="_id"
            columns={columns(handleEdit, handleDelete)}
            dataSource={list}
            loading={loading || deleting}
            pagination={pagination}
            onChange={handleTableChange}
            bordered
          />
        </>
      ) : (
        <Empty description={loading ? 'Đang tải...' : 'Không có cấu hình giờ làm việc'} />
      )}
      <CreateWorkingHoursDialog
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          dispatch(
            fetchWorkingHours({
              isActive,
              page: pagination?.current,
              limit: pagination?.pageSize,
            })
          );
        }}
      />
      <UpdateWorkingHoursDialog
        visible={showUpdateDialog}
        workingHour={selectedWorkingHour}
        onClose={() => setShowUpdateDialog(false)}
        onSuccess={() => {
          setShowUpdateDialog(false);
          setSelectedWorkingHour(null);
          dispatch(
            fetchWorkingHours({
              isActive,
              page: pagination?.current,
              limit: pagination?.pageSize,
            })
          );
        }}
      />
    </Card>
  );
};

export default WorkingHoursList;
