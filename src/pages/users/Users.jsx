import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Spin } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import showDeleteConfirm from '../../components/DeleteConfirm';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import userApi from '../../api/userApi';
import { useDispatch } from 'react-redux';
import { deleteUser } from '../../store/userSlice';
import AlertMessage from '../../components/AlertMessage';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

// ...columns will be defined inside the Users component so we can access dispatch/setAlert

const Users = () => {
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
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserId(record._id);
              setShowEditDialog(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === record._id}
            disabled={!record.isActive}
            title={!record.isActive ? 'Người dùng không hoạt động - không thể xóa' : ''}
            onClick={(e) => {
              e.stopPropagation();
              if (!record.isActive) return;
              // open confirm modal and pass username in the message
              showDeleteConfirm({
                message: `Bạn có xác nhận xóa ${record.username}?`,
                onOk: async () => {
                  try {
                    setDeletingId(record._id);
                    const res = await dispatch(deleteUser(record._id));
                    setDeletingId(null);
                    // check for rejected action
                    if (res.error) {
                      setAlert({ type: 'error', message: res.error.message || 'Xóa thất bại' });
                    } else {
                      setAlert({ type: 'success', message: 'Đã xóa người dùng thành công' });
                      // refresh list
                      fetchUsers();
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
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const dispatch = useDispatch();

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
            bordered
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.itemsPerPage,
              total: pagination.totalItems,
              showSizeChanger: false,
            }}
            rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
            onRow={(record) => ({
              onClick: () => {
                setSelectedUserId(record._id);
                setShowUserDetails(true);
              },
            })}
          />
        )}
      </div>
      {alert && <AlertMessage type={alert.type} message={alert.message} />}
      <CreateUserDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => {
          setShowDialog(false);
          fetchUsers();
        }}
      />
      <EditUserDialog
        visible={showEditDialog}
        userId={selectedUserId}
        onClose={() => setShowEditDialog(false)}
        onSuccess={() => {
          setShowEditDialog(false);
          fetchUsers();
        }}
      />
      <UserDetailsDialog
        visible={showUserDetails}
        userId={selectedUserId}
        onClose={() => setShowUserDetails(false)}
      />
    </MainLayout>
  );
};

export default Users;
