import React from 'react';
import { Modal, Descriptions, Spin } from 'antd';

const VehicleDetailsDialog = ({ open, onClose, vehicle, loading }) => {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title={vehicle ? `Chi tiết xe: ${vehicle.licensePlate}` : 'Chi tiết xe'}>
      <Spin spinning={loading} tip="Đang tải...">
        {vehicle && !loading && (
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
        )}
      </Spin>
    </Modal>
  );
};

export default VehicleDetailsDialog;
