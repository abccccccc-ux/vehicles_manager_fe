import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Row, Col, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';
import showDeleteConfirm from '../../components/DeleteConfirm';
import { deleteDepartment } from '../../store/departmentSlice';
import AlertMessage from '../../components/AlertMessage';
import DepartmentDetailDialog from './DepartmentDetailDialog';
import {
  fetchDepartments,
  setSearch,
  setStatus,
  setPagination,
} from '../../store/departmentSlice';

const statusOptions = [
  { label: 'Hoạt động', value: 'active' },
  { label: 'Ngừng hoạt động', value: 'unactive' },
];

const statusTag = (isActive) =>
  isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>;

const DepartmentsList = () => {
  const dispatch = useDispatch();
  const { list: departments, loading, error, search, status, pagination } = useSelector(
    (state) => state.departments
  );

  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // fetch data khi thay đổi search, filter, hoặc pagination
  useEffect(() => {
    dispatch(
      fetchDepartments({
        search,
        status,
        page: pagination.current,
        limit: pagination.pageSize,
      })
    );
  }, [dispatch, search, status, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (error) setAlert({ type: 'error', message: error });
  }, [error]);

  const handleTableChange = (pag) => {
    dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
  };

  const columns = [
    {
      title: 'Tên phòng ban',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã phòng ban',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Phòng ban cha',
      dataIndex: ['parentDepartment', 'name'],
      key: 'parentDepartment',
      render: (text, record) => record.parentDepartment?.name || '-',
    },
    {
      title: 'Trưởng phòng',
      dataIndex: ['manager', 'name'],
      key: 'manager',
      render: (text, record) => record.manager?.name || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: statusTag,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // edit handler will be implemented later
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            loading={deletingId === record._id}
            disabled={!record.isActive}
            title={!record.isActive ? 'Phòng ban không hoạt động - không thể xóa' : ''}
            onClick={(e) => {
              e.stopPropagation();
              if (!record.isActive) return;
              const confirmMessage = `Bạn có xác nhận xóa ${record.name}?`;
              showDeleteConfirm({
                message: confirmMessage,
                onOk: async () => {
                  try {
                    setDeletingId(record._id);
                    const res = await dispatch(deleteDepartment(record._id));
                    setDeletingId(null);
                    if (res.error) {
                      setAlert({ type: 'error', message: res.error.message || 'Xóa thất bại' });
                    } else {
                      setAlert({ type: 'success', message: res.payload?.message || 'Đã xóa phòng ban' });
                      // re-fetch current page
                      dispatch(fetchDepartments({ search, status, page: pagination.current, limit: pagination.pageSize }));
                    }
                  } catch (err) {
                    setDeletingId(null);
                    setAlert({ type: 'error', message: err.message || 'Xóa thất bại' });
                  }
                },
              });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <Card title="Danh sách phòng ban">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchInput
            value={search}
            onChange={(val) => dispatch(setSearch(val))}
            placeholder="Tìm kiếm tên, mã phòng ban..."
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchFilter
            value={status}
            onChange={(val) => dispatch(setStatus(val))}
            options={statusOptions}
            placeholder="Trạng thái"
          />
        </Col>
      </Row>
  {alert && <AlertMessage type={alert.type} message={alert.message} />}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={departments}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        onRow={(record) => ({
          onClick: () => {
            setSelectedDeptId(record._id);
            setShowDetail(true);
          },
        })}
      />
      <DepartmentDetailDialog
        visible={showDetail}
        departmentId={selectedDeptId}
        onClose={() => setShowDetail(false)}
      />
    </Card>
  );
};

export default DepartmentsList;
