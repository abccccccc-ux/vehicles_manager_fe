import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Row, Col, Button, notification, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';
import showDeleteConfirm from '../../components/DeleteConfirm';
import { deleteDepartment } from '../../store/departmentSlice';
import DepartmentDetailDialog from './DepartmentDetailDialog';
import DepartmentEditDialog from './DepartmentEditDialog';
import CreateDepartmentDialog from './CreateDepartmentDialog';
import useRebounce from '../../hooks/useRebounce';
import {
  fetchDepartments,
  setSearch,
  setPagination,
  setIsActive,
} from '../../store/departmentSlice';

const statusOptions = [
  { label: 'Hoạt động', value: true },
  { label: 'Ngừng hoạt động', value: false },
];

const statusTag = (isActive) =>
  isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>;

const DepartmentsList = () => {
  const dispatch = useDispatch();
  const { list: departments, loading, error, search, isActive, pagination } = useSelector(
    (state) => state.departments
  );

  const [deletingId, setDeletingId] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [localSearch, setLocalSearch] = useState(search || '');

  // debounced dispatcher for search to avoid rapid requests while typing
  const debouncedDispatchSearch = useRebounce((val) => {
    // reset to first page when searching
    dispatch(setPagination({ current: 1, pageSize: pagination.pageSize }));
    dispatch(setSearch(val));
  }, 400);

  // fetch data khi thay đổi search, filter, hoặc pagination
  useEffect(() => {
    dispatch(
      fetchDepartments({
        search,
        isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      })
    );
  }, [dispatch, search, isActive, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (error) message.error(error.message || 'Đã có lỗi xảy ra');
  }, [error]);

  // keep localSearch in sync if search is updated elsewhere
  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  const handleTableChange = (pag) => {
    dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
  };

  const columns = [
    {
      title: 'Tên đơn vị',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã đơn vị',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Trưởng đơn vị',
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
              setSelectedDeptId(record._id);
              setShowEditDialog(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            loading={deletingId === record._id}
            disabled={!record.isActive}
            title={!record.isActive ? 'đơn vị không hoạt động - không thể xóa' : ''}
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
                      notification.error({ message: 'Lỗi', description: res.error.message || 'Xóa thất bại', placement: 'bottomRight' });
                    } else {
                      notification.success({ message: 'Thành công', description: res.payload?.message || 'Đã xóa đơn vị', placement: 'bottomRight' });
                      dispatch(fetchDepartments({ search, isActive, page: pagination.current, limit: pagination.pageSize }));
                    }
                  } catch (err) {
                    setDeletingId(null);
                    notification.error({ message: 'Lỗi', description: err.message || 'Xóa thất bại', placement: 'bottomRight' });
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
    <Card 
      title="Danh sách đơn vị"
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchInput
            value={localSearch}
            onChange={(val) => {
              setLocalSearch(val);
              debouncedDispatchSearch(val);
            }}
            placeholder="Tìm kiếm tên, mã đơn vị..."
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchFilter
            value={isActive}
            onChange={(val) => dispatch(setIsActive(val))}
            options={statusOptions}
            placeholder="Trạng thái"
            style={{ minWidth: 150}}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateDialog(true)}
          >
            Tạo mới
          </Button>
        </Col>
      </Row>
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
      <DepartmentEditDialog
        visible={showEditDialog}
        departmentId={selectedDeptId}
        onClose={() => setShowEditDialog(false)}
      />
      <CreateDepartmentDialog
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </Card>
  );
};

export default DepartmentsList;
