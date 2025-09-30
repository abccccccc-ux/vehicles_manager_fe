import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Spin } from 'antd';
import CreateUserDialog from './CreateUserDialog';
import userApi from '../../api/userApi';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

const columns = [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    className: 'font-semibold',
  },
  {
    title: 'Họ tên',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'SĐT',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role) => {
      let color = 'blue';
      if (role === 'super_admin') color = 'purple';
      return (
        <Tag color={color} className="capitalize">
          {role}
        </Tag>
      );
    },
  },
  {
    title: 'Active',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (active) =>
      active ? (
        <Tag color="green">Active</Tag>
      ) : (
        <Tag color="red">Inactive</Tag>
      ),
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date) => new Date(date).toLocaleString('vi-VN'),
  },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers({ page: 1, limit: 10 });
      setUsers(res.data.data.map((u) => ({ ...u, key: u._id })));
      setPagination(res.data.pagination);
    } catch (error) {
      // Xử lý lỗi
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Điều hướng không đủ quyền (đặt sau khi đã gọi Hook xong)
  if (!currentUser || currentUser.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: 24 }}>
        <Button type="primary" onClick={() => setShowDialog(true)}>
          Thêm mới người dùng
        </Button>
      </div>
      <div style={{ margin: 16 }} className="bg-white rounded-xl shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.itemsPerPage,
              total: pagination.totalItems,
              showSizeChanger: false,
            }}
            rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
          />
        )}
      </div>
      <CreateUserDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => {
          setShowDialog(false);
          fetchUsers();
        }}
      />
    </MainLayout>
  );
};

export default Users;
