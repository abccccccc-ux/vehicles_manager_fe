import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Avatar, Alert } from 'antd';
import { 
  WarningOutlined, 
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNotificationContext } from './NotificationProvider';
import './HighPriorityNotificationPopup.css';

const { Title, Text } = Typography;

const HighPriorityNotificationPopup = ({ __mockContext }) => {
  const realContext = useNotificationContext();
  const { notifications, markAsRead } = __mockContext || realContext;
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Lắng nghe notifications có priority high
  useEffect(() => {
    const highPriorityNotifications = notifications.filter(
      n => n.priority === 'high' && !n.read && !n.dismissed
    );

    if (highPriorityNotifications.length > 0 && !currentNotification) {
      // Hiển thị notification đầu tiên trong hàng đợi
      setCurrentNotification(highPriorityNotifications[0]);
      setIsVisible(true);
    }
  }, [notifications, currentNotification]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'vehicle_verification':
        return <ExclamationCircleOutlined style={{ color: '#ffffff' }} />;
      case 'vehicle_verified':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'working_hours_request':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'working_hours_request_update':
        return <InfoCircleOutlined style={{ color: '#52c41a' }} />;
      case 'vehicle_access':
        return <CarOutlined style={{ color: '#1890ff' }} />;
      default:
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'vehicle_verification':
        return '#fa8c16';
      case 'vehicle_verified':
        return '#52c41a';
      case 'working_hours_request':
        return '#1890ff';
      case 'working_hours_request_update':
        return '#52c41a';
      case 'vehicle_access':
        return '#1890ff';
      default:
        return '#fa8c16';
    }
  };

  const handleAccept = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
      handleNotificationAction('accept');
      closePopup();
    }
  };

  const handleReject = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
      handleNotificationAction('reject');
      closePopup();
    }
  };

  const handleView = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
      handleNotificationAction('view');
      closePopup();
    }
  };

  const handleDismiss = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
      closePopup();
    }
  };

  const handleNotificationAction = (action) => {
    if (!currentNotification) return;

    const { type, data } = currentNotification;

    // Emit event to parent components for better navigation handling
    window.dispatchEvent(new CustomEvent('high-priority-notification-action', {
      detail: { action, type, data, notification: currentNotification }
    }));

    switch (type) {
      case 'vehicle_verification':
        if (action === 'view') {
          // Navigate to vehicle verification page
          const url = `/access-logs?licensePlate=${data?.licensePlate}&verification=pending`;
          if (window.location.pathname !== '/access-logs') {
            window.location.href = url;
          } else {
            window.history.pushState({}, '', url);
            window.dispatchEvent(new CustomEvent('navigate-to-verification', { detail: { licensePlate: data?.licensePlate } }));
          }
        }
        break;
        
      case 'working_hours_request':
        if (action === 'view') {
          const url = `/working-hours-requests?id=${data?.requestId}&status=pending`;
          if (window.location.pathname !== '/working-hours-requests') {
            window.location.href = url;
          } else {
            window.history.pushState({}, '', url);
            window.dispatchEvent(new CustomEvent('navigate-to-request', { detail: { id: data?.requestId } }));
          }
        } else if (action === 'accept') {
          console.log('Approving working hours request:', data?.requestId);
          window.dispatchEvent(new CustomEvent('approve-working-hours-request', { 
            detail: { requestId: data?.requestId, notification: currentNotification } 
          }));
        } else if (action === 'reject') {
          console.log('Rejecting working hours request:', data?.requestId);
          window.dispatchEvent(new CustomEvent('reject-working-hours-request', { 
            detail: { requestId: data?.requestId, notification: currentNotification } 
          }));
        }
        break;
        
      default:
        console.log('Notification action:', action, 'for type:', type);
    }
  };

  const closePopup = () => {
    setIsVisible(false);
    setCurrentNotification(null);

    // Kiểm tra xem còn notification high priority nào không
    setTimeout(() => {
      const remainingHighPriority = notifications.filter(
        n => n.priority === 'high' && !n.read && !n.dismissed && n.id !== currentNotification?.id
      );
      
      if (remainingHighPriority.length > 0) {
        setCurrentNotification(remainingHighPriority[0]);
        setIsVisible(true);
      }
    }, 500);
  };

  const renderActionButtons = () => {
    if (!currentNotification) return null;

    const { type } = currentNotification;

    switch (type) {
      case 'vehicle_verification':
        return (
          <div className="verification-actions">
            <Button onClick={handleDismiss} style={{ marginRight: 8 }}>
              Bỏ qua
            </Button>
            <Button type="primary" onClick={handleView}>
              Xác minh ngay
            </Button>
          </div>
        );
        
      case 'working_hours_request':
        return (
          <Space>
            <Button onClick={handleDismiss}>
              Bỏ qua
            </Button>
            <Button danger onClick={handleReject}>
              Từ chối
            </Button>
            <Button type="primary" onClick={handleAccept}>
              Phê duyệt
            </Button>
          </Space>
        );
        
      default:
        return (
          <Space>
            <Button onClick={handleDismiss}>
              Bỏ qua
            </Button>
            <Button type="primary" onClick={handleView}>
              Xem chi tiết
            </Button>
          </Space>
        );
    }
  };

  const getModalClassName = () => {
    if (!currentNotification) return 'high-priority-notification-popup';
    
    const { type } = currentNotification;
    switch (type) {
      case 'vehicle_verification':
        return 'high-priority-notification-popup vehicle-verification-notification';
      case 'working_hours_request':
        return 'high-priority-notification-popup working-hours-notification';
      default:
        return 'high-priority-notification-popup';
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Modal
      title={
        <Space align="center">
          <Avatar 
            size="large" 
            icon={getNotificationIcon(currentNotification.type)}
            style={{ backgroundColor: getNotificationColor(currentNotification.type) }}
          />
          <div>
            <Title level={4} style={{ margin: 0, color: getNotificationColor(currentNotification.type) }}>
              {currentNotification.title}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(currentNotification.timestamp).toLocaleString('vi-VN')}
            </Text>
          </div>
        </Space>
      }
      open={isVisible}
      onCancel={handleDismiss}
      footer={null}
      width={500}
      centered
      maskClosable={currentNotification.type !== 'vehicle_verification'}
      closable={currentNotification.type !== 'vehicle_verification'}
      className={getModalClassName()}
      style={{
        zIndex: 9999
      }}
    >
      <div style={{ marginTop: 16 }}>
        <Alert
          message="Thông báo ưu tiên cao"
          description={currentNotification.message}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Hiển thị thêm thông tin chi tiết nếu có */}
        {currentNotification.data && (
          <div className="notification-details">
            <Text strong>Thông tin chi tiết:</Text>
            <div style={{ marginTop: 8 }}>
              {currentNotification.type === 'vehicle_verification' && (
                <>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Cổng: </Text><Text code>{currentNotification.data.gateName || currentNotification.data.gateId}</Text></div>
                  <div><Text>Hành động: </Text><Text code>{currentNotification.data.action === 'entry' ? 'Vào' : 'Ra'}</Text></div>
                </>
              )}
              
              {currentNotification.type === 'working_hours_request' && (
                <>
                  <div><Text>Người yêu cầu: </Text><Text code>{currentNotification.data.requesterName || currentNotification.data.username || currentNotification.data.requestedBy?.name}</Text></div>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Loại: </Text><Text code>{currentNotification.data.requestType || 'Yêu cầu ra/vào'}</Text></div>
                </>
              )}

              {currentNotification.type === 'vehicle_verified' && (
                <>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Kết quả: </Text><Text style={{ color: currentNotification.data.verificationStatus === 'approved' ? '#52c41a' : '#ff4d4f' }}>
                    {currentNotification.data.verificationStatus === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                  </Text></div>
                </>
              )}

              {currentNotification.type === 'working_hours_request_update' && (
                <>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Trạng thái: </Text><Text style={{ color: currentNotification.data.status === 'approved' ? '#52c41a' : '#ff4d4f' }}>
                    {currentNotification.data.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                  </Text></div>
                  <div><Text>Người duyệt: </Text><Text code>{currentNotification.data.approverName}</Text></div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="notification-actions">
          {renderActionButtons()}
        </div>
      </div>
    </Modal>
  );
};

export default HighPriorityNotificationPopup;
