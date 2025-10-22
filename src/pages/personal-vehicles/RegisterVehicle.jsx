import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, Spin } from 'antd';
import AlertMessage from '../../components/AlertMessage';
import vehicleApi from '../../api/vehicleApi';

const { Option } = Select;

// Dialog component for registering a vehicle
const RegisterVehicleDialog = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const onFinish = async (values) => {
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const owner = localStorage.getItem('userId');
      const body = { ...values, owner };
      const response = await vehicleApi.createVehicle(body);
      if (response.success) {
        setAlert({ type: 'success', message: response.message });
        form.resetFields();
        if (onSuccess) onSuccess(response);
      } else {
        setAlert({ type: 'error', message: response.message || 'Đăng kí thất bại' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error?.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAlert({ type: '', message: '' });
    onClose && onClose();
  };

  return (
    <Modal visible={visible} title="Đăng kí phương tiện cá nhân" onCancel={handleCancel} footer={null} destroyOnClose>
      {alert.message && <AlertMessage type={alert.type} message={alert.message} />}

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
