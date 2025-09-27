import React, { useState } from 'react';
import { Form, Input, Button, Select, Spin } from 'antd';
import AlertMessage from '../../components/AlertMessage';
import vehicleApi from '../../api/vehicleApi';
import MainLayout from '../../layouts/MainLayout';

const { Option } = Select;

const RegisterVehicle = () => {
  const [form] = Form.useForm(); // quản lý form
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const onFinish = async (values) => {
    console.log("Form values:", values); // debug xem có thiếu field không
    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const owner = localStorage.getItem('userId');
      const body = { ...values, owner };
      const response = await vehicleApi.createVehicle(body);

      if (response.success) {
        setAlert({ type: 'success', message: response.message });
        form.resetFields(); // clear form sau khi thành công
      } else {
        setAlert({ type: 'error', message: response.message || 'Đăng kí thất bại' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error?.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
        <h2 style={{ textAlign: 'center' }}>Đăng kí phương tiện cá nhân</h2>
        {alert.message && <AlertMessage type={alert.type} message={alert.message} />}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
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
            <Select placeholder="Chọn loại phương tiện" showSearch={false}>
              <Option value="car">Ô tô</Option>
              <Option value="motorbike">Xe máy</Option>
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
            <Button type="primary" htmlType="submit" block disabled={loading}>
              {loading ? <Spin /> : 'Đăng kí'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </MainLayout>
  );
};

export default RegisterVehicle;
