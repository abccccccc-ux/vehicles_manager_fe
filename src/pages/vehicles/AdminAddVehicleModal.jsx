import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, notification } from 'antd';
import vehicleApi from '../../api/vehicleApi';
import userApi from '../../api/userApi';
import useDebounce from '../../hooks/useDebounce';

const { Option } = Select;

const AdminAddVehicleModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Fetch danh sách nhân viên khi modal mở hoặc từ khóa tìm kiếm thay đổi
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, debouncedSearch]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = { isActive: true, limit: 100 };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      const response = await userApi.getUsers(params);
      
      // response.data.data là mảng users trực tiếp
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setUsers(response.data.data);
      } else {
        console.warn('Unexpected response structure:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách nhân viên',
        placement: 'bottomRight'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const body = {
        licensePlate: values.licensePlate,
        vehicleType: values.vehicleType,
        name: values.name,
        color: values.color,
        description: values.description,
        owner: values.owner, // ID của chủ xe được chọn
      };
      
      const response = await vehicleApi.createVehicle(body);
      
      if (response.success) {
        form.resetFields();
        notification.success({
          message: 'Thành công',
          description: response.message || 'Thêm xe thành công',
          placement: 'bottomRight'
        });
        
        if (onSuccess) {
          onSuccess(response);
        }
        
        onClose();
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.message || 'Thêm xe thất bại',
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
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose && onClose();
  };

  return (
    <Modal
      open={open}
      title="Thêm xe mới"
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Chủ xe"
          name="owner"
          rules={[{ required: true, message: 'Vui lòng chọn chủ xe' }]}
        >
          <Select
            placeholder="Tìm kiếm và chọn chủ xe"
            showSearch
            loading={loadingUsers}
            filterOption={false} // Tắt lọc phía client
            onSearch={setSearch} // Cập nhật từ khóa tìm kiếm
            defaultActiveFirstOption={false}
            notFoundContent={null}
            options={users.map(user => ({
              value: user._id,
              label: `${user.name} - ${user.username}`,
              key: user._id
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Biển số xe"
          name="licensePlate"
          rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
        >
          <Input placeholder="VD: 30A-12345" />
        </Form.Item>

        <Form.Item
          label="Loại phương tiện"
          name="vehicleType"
          rules={[{ required: true, message: 'Vui lòng chọn loại phương tiện' }]}
        >
          <Select placeholder="Chọn loại phương tiện">
            <Option value="car">Ô tô</Option>
            <Option value="motorcycle">Xe máy</Option>
            <Option value="bicycle">Xe đạp</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Tên phương tiện"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên phương tiện' }]}
        >
          <Input placeholder="VD: Honda Vision" />
        </Form.Item>

        <Form.Item
          label="Màu sắc"
          name="color"
          rules={[{ required: true, message: 'Vui lòng nhập màu sắc' }]}
        >
          <Input placeholder="VD: Đỏ, Trắng, Đen..." />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả thêm (nếu có)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Thêm xe
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminAddVehicleModal;
