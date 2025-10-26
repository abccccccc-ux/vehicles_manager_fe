import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, Spin, notification } from 'antd';
// inline AlertMessage replaced by antd notification (bottomRight)
import vehicleApi from '../../api/vehicleApi';

const { Option } = Select;

// Dialog component for registering a vehicle
const RegisterVehicleDialog = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    // using notification instead of inline alert
    try {
      const owner = localStorage.getItem('userId');
      const body = { ...values, owner };
      const response = await vehicleApi.createVehicle(body);
      if (response.success) {
        notification.success({ message: 'Thành công', description: response.message, placement: 'bottomRight' });
        form.resetFields();
        if (onSuccess) onSuccess(response);
      } else {
        notification.error({ message: 'Lỗi', description: response.message || 'Đăng kí thất bại', placement: 'bottomRight' });
      }
    } catch (error) {
      notification.error({ message: 'Lỗi', description: error?.response?.data?.message || 'Có lỗi xảy ra', placement: 'bottomRight' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose && onClose();
  };

  return (
    <Modal visible={visible} title="Đăng kí phương tiện cá nhân" onCancel={handleCancel} footer={null} destroyOnClose>
  {/* Notifications use antd notification (bottomRight) */}

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Biển số xe" name="licensePlate" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}>
          <Input placeholder="VD: 30A-12345" />
        </Form.Item>

        <Form.Item label="Loại phương tiện" name="vehicleType" rules={[{ required: true, message: 'Vui lòng chọn loại phương tiện' }]}>
          <Select placeholder="Chọn loại phương tiện" showSearch={false}>
            <Option value="car">Ô tô</Option>
            <Option value="motorbike">Xe máy</Option>
            <Option value="bicycle">Xe đạp</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tên phương tiện" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên phương tiện' }]}>
          <Input placeholder="VD: Honda Vision" />
        </Form.Item>

        <Form.Item label="Màu sắc" name="color" rules={[{ required: true, message: 'Vui lòng nhập màu sắc' }]}>
          <Input placeholder="VD: Đỏ, Trắng, Đen..." />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả thêm (nếu có)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={loading}>
            {loading ? <Spin /> : 'Đăng kí'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegisterVehicleDialog;
