import React, { useEffect, useState } from 'react';
import { Button, Table, Tag } from 'antd';
import { notification } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import showDeleteConfirm from '../../components/DeleteConfirm';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import userApi from '../../api/userApi';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';
import useDebounce from '../../hooks/useDebounce';
import { useDispatch } from 'react-redux';
import { deleteUser } from '../../store/userSlice';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import AlertMessage from '../../components/AlertMessage';


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
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        if (role === 'super_admin') color = 'purple';
        if (role === 'supervisor') color = 'orange';
        if (role === 'admin') color = 'yellow';
        return (
          <Tag color={color} className="capitalize">
            {
              (role === "super_admin") ? "Quản trị viên"
                : (role === "user") ? "Nhân viên"
                  : (role === "admin") ? "Trưởng đơn vị"
                    : (role === "supervisor") ? "Trực ban học viện"
                      : null
            }
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Không hoạt động</Tag>
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
                      notification.error({ message: 'Lỗi', description: res.error.message || 'Xóa thất bại', placement: 'bottomRight' });
                    } else {
                      notification.success({ message: 'Thành công', description: 'Đã xóa người dùng thành công', placement: 'bottomRight' });
                      // refresh list
                      fetchUsers();
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
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 450);
  const [role, setRole] = useState(undefined);
  const [isActive, setIsActive] = useState(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        role: role || undefined,
        // send isActive only when explicitly true/false
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      };
      const res = await userApi.getUsers(params);
      setUsers(res.data.data.map((u) => ({ ...u, key: u._id })));
      setPagination(res.data.pagination);
    } catch (error) {
      // Xử lý lỗi
    }
    setLoading(false);
  };

  // initial fetch + when filters/page change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, role, isActive, page]);

  return (
    <MainLayout>
      <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm theo username, tên hoặc số điện thoại"
            style={{ width: 320 }}
          />
          <SearchFilter
            value={role}
            onChange={(v) => setRole(v)}
            placeholder="Chọn quyền"
            style={{ width: 180 }}
            options={[
              { label: 'Nhân viên', value: 'user' },
              { label: 'Trưởng đơn vị', value: 'admin' },
              { label: 'Trực ban học viện', value: 'supervisor'},
              { label: 'Quản trị viên', value: 'super_admin' },
            ]}
          />
          <SearchFilter
            value={isActive}
            onChange={(v) => {
              setIsActive(typeof v === 'string' ? (v === 'true') : v);
            }}
            placeholder="Trạng thái"
            style={{ width: 160 }}
            options={[
              { label: 'Hoạt động', value: true },
              { label: 'Không hoạt động', value: false },
            ]}
          />
        </div>
        <div>
          <Button type="primary" onClick={() => setShowDialog(true)}>
            Thêm mới người dùng
          </Button>
        </div>
      </div>
      <div style={{ margin: 16 }} className="bg-white rounded-xl shadow-sm p-4">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          bordered
          pagination={{
            current: pagination.currentPage || page,
            pageSize: pagination.itemsPerPage || limit,
            total: pagination.totalItems || 0,
            showSizeChanger: false,
          }}
          rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
          onRow={(record) => ({
            onClick: () => {
              setSelectedUserId(record._id);
              setShowUserDetails(true);
            },
          })}
          onChange={(pagination) => {
            if (pagination && pagination.current) setPage(pagination.current);
          }}
        />
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
