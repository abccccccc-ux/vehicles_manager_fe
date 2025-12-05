import React from 'react';
import { Modal, Descriptions, Tag, Spin, Button, Space, message } from 'antd';
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import { updateViolationStatus } from '../../api/workingHoursViolationApi';

const WorkingHoursViolationDetailsDialog = ({ open, onClose, violation, loading }) => {
  if (!violation && !loading) return null;

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateViolationStatus(violation._id, { verificationStatus: newStatus });
      message.success('Cập nhật trạng thái thành công');
      onClose();
      // Optionally refresh the table here
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const renderViolationType = (type) => {
    const violationTypes = {
      'late_entry': 'Đi muộn',
      'early_exit': 'Về sớm',
      'no_permission': 'Không có yêu cầu',
      'invalid_time': 'Ngoài giờ cho phép',
      'unauthorized_access': 'Truy cập trái phép'
    };
    return violationTypes[type] || type;
  };

  const renderSeverity = (severity) => {
    const colors = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'purple'
    };
    const labels = {
      'low': 'Nhẹ',
      'medium': 'Vừa',
      'high': 'Nặng',
      'critical': 'Rất nặng'
    };
    return (
      <Tag color={colors[severity] || 'default'}>
        {labels[severity] || severity}
      </Tag>
    );
  };

  const renderStatus = (status) => {
    const colors = {
      pending: 'gold',
      verified: 'green',
      rejected: 'red'
    };
    const labels = {
      pending: 'Chờ xác minh',
      verified: 'Đã xác minh',
      rejected: 'Từ chối'
    };
    return (
      <Tag color={colors[status] || 'default'}>
        {labels[status] || status}
      </Tag>
    );
  };

  const Footer = () => {
    if (loading || !violation) return null;
    
    // Sử dụng verificationStatus thay vì status
    if (violation.verificationStatus === 'pending') {
      return (
        <Space>
          <Button onClick={onClose}>
            Đóng
          </Button>
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => handleStatusUpdate('verified')}
          >
            Xác minh
          </Button>
          <Button 
            danger
            icon={<StopOutlined />}
            onClick={() => handleStatusUpdate('rejected')}
          >
            Từ chối
          </Button>
        </Space>
      );
    }
    
    return (
      <Button onClick={onClose}>
        Đóng
      </Button>
    );
  };

  return (
    <Modal
      title="Chi tiết vi phạm giờ làm việc"
      open={open}
      onCancel={onClose}
      footer={<Footer />}
      width={800}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : violation ? (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Biển số xe" span={1}>
            <strong>{violation.licensePlate}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Chủ xe / Người điều khiển" span={1}>
            {violation.owner?.name || violation.driver?.name || 'N/A'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Loại vi phạm" span={1}>
            {renderViolationType(violation.violationType)}
          </Descriptions.Item>
          <Descriptions.Item label="Mức độ vi phạm" span={1}>
            {renderSeverity(violation.severity)}
          </Descriptions.Item>
          
          <Descriptions.Item label="Thời gian vi phạm" span={1}>
            {new Date(violation.createdAt || violation.violationTime).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Giờ cho phép" span={1}>
            {violation.allowedTime || 'N/A'}
          </Descriptions.Item>
          
          {violation.lateMinutes && (
            <Descriptions.Item label="Số phút đi muộn" span={1}>
              {violation.lateMinutes} phút
            </Descriptions.Item>
          )}
          
          {violation.earlyMinutes && (
            <Descriptions.Item label="Số phút về sớm" span={1}>
              {violation.earlyMinutes} phút
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Trạng thái xác minh" span={1}>
            {renderStatus(violation.verificationStatus || violation.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Cổng phát hiện" span={1}>
            {violation.gateName || 'N/A'}
          </Descriptions.Item>
          
          {violation.department && (
            <Descriptions.Item label="Phòng ban" span={1}>
              {violation.department.name}
            </Descriptions.Item>
          )}
          
          {violation.vehicle && (
            <Descriptions.Item label="Thông tin xe" span={1}>
              {violation.vehicle.vehicleType === 'car' ? 'Xe ô tô' : 'Xe máy'} - {violation.vehicle.color}
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Thời gian tạo" span={1}>
            {new Date(violation.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật cuối" span={1}>
            {new Date(violation.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          
          {violation.notes && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {violation.notes}
            </Descriptions.Item>
          )}
          
          {violation.processedBy && (
            <Descriptions.Item label="Người xử lý" span={1}>
              {violation.processedBy.name}
            </Descriptions.Item>
          )}
          
          {violation.processedAt && (
            <Descriptions.Item label="Thời gian xử lý" span={1}>
              {new Date(violation.processedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <div>Không có dữ liệu</div>
      )}
    </Modal>
  );
};

export default WorkingHoursViolationDetailsDialog;
