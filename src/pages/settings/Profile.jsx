import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Modal, Form, Input, notification, Spin, Avatar, Tag } from 'antd';
import { UserOutlined, EditOutlined, PhoneOutlined, TeamOutlined, IdcardOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import userApi from '../../api/userApi';
import MainLayout from '../../layouts/MainLayout';

const Profile = () => {
  const { user: authUser } = useSelector(state => state.auth);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const userId = authUser?._id || localStorage.getItem('userId');
      const response = await userApi.getUserById(userId);
      
      if (response.data?.success) {
        setUserProfile(response.data.data.user);
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải thông tin cá nhân',
        placement: 'bottomRight'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditProfile = () => {
    form.setFieldsValue({
      name: userProfile?.name,
      phone: userProfile?.phone
    });
    setEditModalOpen(true);
  };

  const handleUpdateProfile = async (values) => {
    setSaving(true);
    try {
      const userId = authUser?._id || localStorage.getItem('userId');
      const response = await userApi.editUser(userId, {
        name: values.name,
        phone: values.phone
      });

      if (response.data?.success) {
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật thông tin cá nhân thành công',
          placement: 'bottomRight'
        });
        setEditModalOpen(false);
        fetchUserProfile();
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.data?.message || 'Cập nhật thất bại',
          placement: 'bottomRight'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: error?.response?.data?.message || 'Có lỗi xảy ra',
        placement: 'bottomRight'
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'super_admin': { text: 'Super Admin', color: 'red' },
      'admin': { text: 'Admin', color: 'blue' },
      'user': { text: 'Người dùng', color: 'green' },
      'supervisor': { text: 'Giám sát', color: 'orange' }
    };
    return roleMap[role] || { text: role, color: 'default' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const roleInfo = getRoleLabel(userProfile?.role);

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserOutlined style={{ fontSize: '24px' }} />
              <span>Thông tin cá nhân</span>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditProfile}
            >
              Chỉnh sửa
            </Button>
          }
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px 0' }}>{userProfile?.name}</h2>
          <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
        </div>

        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item 
            label={<span><IdcardOutlined style={{ marginRight: '8px' }} />Tên đăng nhập</span>}
          >
            {userProfile?.username}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={<span><UserOutlined style={{ marginRight: '8px' }} />Họ và tên</span>}
          >
            {userProfile?.name}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<span><PhoneOutlined style={{ marginRight: '8px' }} />Số điện thoại</span>}
          >
            {userProfile?.phone || 'Chưa cập nhật'}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<span><TeamOutlined style={{ marginRight: '8px' }} />Đơn vị</span>}
          >
            {userProfile?.department?.name || 'Chưa có đơn vị'} 
            {userProfile?.department?.code && ` (${userProfile.department.code})`}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={userProfile?.isActive ? 'success' : 'error'}>
              {userProfile?.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Đăng nhập lần cuối">
            {userProfile?.lastLogin 
              ? new Date(userProfile.lastLogin).toLocaleString('vi-VN')
              : 'Chưa có thông tin'}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo tài khoản">
            {userProfile?.createdAt 
              ? new Date(userProfile.createdAt).toLocaleString('vi-VN')
              : 'Chưa có thông tin'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={saving}>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </MainLayout>
  );
};

export default Profile;
