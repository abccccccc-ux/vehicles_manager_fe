import React, { useEffect } from 'react';
import { Card, Table, Tag, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';
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
    if (error) message.error(error);
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString('vi-VN'),
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
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={departments}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
      />
    </Card>
  );
};

export default DepartmentsList;
