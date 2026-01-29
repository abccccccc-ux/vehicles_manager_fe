import React, { useState } from 'react';
import { Modal, Descriptions, Spin, Button, Space, message } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { deleteVehicle } from '../../api/vehicleApi';
import { isHighLevelAdmin } from '../../utils/permissions';
import { formatLicensePlate } from '../../utils/licensePlate';

const VehicleDetailsDialog = ({ open, onClose, vehicle, loading, onDeleteSuccess }) => {
  const { user } = useSelector(state => state.auth);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa phương tiện',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa phương tiện "${vehicle?.licensePlate}" không? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleting(true);
        try {
          const response = await deleteVehicle(vehicle._id);
          if (response.success) {
            message.success('Xóa phương tiện thành công');
            onClose();
            if (onDeleteSuccess) {
              onDeleteSuccess();
            }
          } else {
            message.error(response.message || 'Xóa phương tiện thất bại');
          }
        } catch (error) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa phương tiện');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const canDelete = user && isHighLevelAdmin(user.role);

  const footer = canDelete && vehicle ? (
    <Space>
      <Button onClick={onClose}>Đóng</Button>
      <Button 
        danger 
        icon={<DeleteOutlined />} 
        onClick={handleDelete}
        loading={deleting}
      >
        Xóa phương tiện
      </Button>
    </Space>
  ) : null;

  return (
    <Modal 
      open={open} 
      onCancel={onClose} 
      footer={footer} 
      title={vehicle ? `Chi tiết xe: ${formatLicensePlate(vehicle.licensePlate)}` : 'Chi tiết xe'}
    >
      <Spin spinning={loading} tip="Đang tải...">
        {vehicle && !loading && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Biển số">{formatLicensePlate(vehicle.licensePlate)}</Descriptions.Item>
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
