import React from 'react';
import { Modal, Descriptions } from 'antd';

const VehicleDetailsDialog = ({ open, onClose, vehicle }) => {
  if (!vehicle) return null;
  return (
    <Modal open={open} onCancel={onClose} footer={null} title={`Chi tiết xe: ${vehicle.licensePlate}`}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Biển số">{vehicle.licensePlate}</Descriptions.Item>
        <Descriptions.Item label="Tên xe">{vehicle.name}</Descriptions.Item>
        <Descriptions.Item label="Loại xe">{vehicle.vehicleType}</Descriptions.Item>
        <Descriptions.Item label="Màu">{vehicle.color}</Descriptions.Item>
        <Descriptions.Item label="Chủ xe">{vehicle.owner?.name}</Descriptions.Item>
        <Descriptions.Item label="Ngày đăng ký">{new Date(vehicle.registrationDate).toLocaleString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{vehicle.isActive ? 'Hoạt động' : 'Ngừng'}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{vehicle.description}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default VehicleDetailsDialog;
