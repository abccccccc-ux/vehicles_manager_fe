import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updateVehicle } from '../../store/vehicleSlice';

const { Option } = Select;

const UpdatePersonalVehicleDialog = ({ visible, onClose, vehicle, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const updating = useSelector((state) => state.vehicle.updating);

  useEffect(() => {
    if (vehicle) {
      form.setFieldsValue({
        vehicleType: vehicle.vehicleType || 'car',
        licensePlate: vehicle.licensePlate || '',
        color: vehicle.color || '',
        name: vehicle.name || '',
      });
    } else {
      form.resetFields();
    }
  }, [vehicle, form]);


  const handleFinish = async (values) => {
    if (!vehicle || !vehicle._id) {
      return;
    }

    try {
      const action = await dispatch(updateVehicle({ id: vehicle._id, body: values }));
      if (action.type && action.type.endsWith('/fulfilled')) {
        if (onSuccess) onSuccess(action.payload);
      }
    } catch (e) {
    }
  };

  return (
    <Modal
      title="Cập nhật phương tiện"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="vehicleType" label="Loại xe" rules={[{ required: true, message: 'Chọn loại xe' }]}>
          <Select>
            <Option value="car">Ô tô</Option>
            <Option value="motorbike">Xe máy</Option>
          </Select>
        </Form.Item>

        <Form.Item name="licensePlate" label="Biển số" rules={[{ required: true, message: 'Nhập biển số' }]}> 
          <Input />
        </Form.Item>

        <Form.Item name="name" label="Tên xe" rules={[{ required: true, message: 'Nhập tên xe' }]}> 
          <Input />
        </Form.Item>

        <Form.Item name="color" label="Màu" rules={[{ required: true, message: 'Nhập màu' }]}> 
          <Input />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={updating}>Lưu</Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePersonalVehicleDialog;
