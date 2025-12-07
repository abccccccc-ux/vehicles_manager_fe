import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Avatar, Alert } from 'antd';
import { 
  WarningOutlined, 
  InfoCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useNotificationContext } from './NotificationProvider';
import AccessLogVerificationModal from './AccessLogVerificationModal';

const { Title, Text } = Typography;

const HighPriorityNotificationPopup = ({ __mockContext }) => {
  const realContext = useNotificationContext();
  const { notifications, markAsRead } = __mockContext || realContext;
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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
      case 'access_log_verification':
        return <ExclamationCircleOutlined style={{ color: '#ffffff' }} />;
      case 'unknown_vehicle_access':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'working_hours_request':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'access_log_verification':
        return '#fa8c16';
      case 'unknown_vehicle_access':
        return '#ff4d4f';
      case 'working_hours_request':
        return '#1890ff';
      default:
        return '#fa8c16';
    }
  };

  const handleAccept = () => {
    if (currentNotification) {
      // Đánh dấu đã đọc
      markAsRead(currentNotification.id);
      
      // Đối với access log verification, hiển thị modal chi tiết thay vì accept trực tiếp
      if (currentNotification.type === 'access_log_verification') {
        setShowVerificationModal(true);
        closePopup();
        return;
      }
      
      // Xử lý action tùy theo type cho các loại khác
      handleNotificationAction('accept');
      
      closePopup();
    }
  };

  const handleReject = () => {
    if (currentNotification) {
      // Đánh dấu đã đọc
      markAsRead(currentNotification.id);
      
      // Xử lý action tùy theo type
      handleNotificationAction('reject');
      
      closePopup();
    }
  };

  const handleView = () => {
    if (currentNotification) {
      // Đánh dấu đã đọc
      markAsRead(currentNotification.id);
      
      // Đối với access log verification, hiển thị modal chi tiết
      if (currentNotification.type === 'access_log_verification') {
        setShowVerificationModal(true);
        closePopup();
        return;
      }
      
      // Xử lý action tùy theo type cho các loại khác
      handleNotificationAction('view');
      
      closePopup();
    }
  };

  const handleDismiss = () => {
    if (currentNotification) {
      // Đánh dấu đã đọc và dismissed
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
      case 'access_log_verification':
        if (action === 'view') {
          // Navigate to access log details
          const url = `/access-logs?id=${data.accessLogId}&verification=pending`;
          if (window.location.pathname !== '/access-logs') {
            window.location.href = url;
          } else {
            // If already on access logs page, just update the URL and emit event
            window.history.pushState({}, '', url);
            window.dispatchEvent(new CustomEvent('navigate-to-access-log', { detail: { id: data.accessLogId } }));
          }
        }
        break;
        
      case 'unknown_vehicle_access':
        if (action === 'view') {
          // Navigate to access log for verification
          const url = `/access-logs?id=${data.accessLogId}&highlight=true&unknown=true`;
          if (window.location.pathname !== '/access-logs') {
            window.location.href = url;
          } else {
            // If already on access logs page, just update the URL and emit event
            window.history.pushState({}, '', url);
            window.dispatchEvent(new CustomEvent('navigate-to-access-log', { detail: { id: data.accessLogId, unknown: true } }));
          }
        }
        break;
        
      case 'working_hours_request':
        if (action === 'view') {
          // Navigate to working hours requests
          const url = `/working-hours-requests?id=${data.requestId}&status=pending`;
          if (window.location.pathname !== '/working-hours-requests') {
            window.location.href = url;
          } else {
            window.history.pushState({}, '', url);
            window.dispatchEvent(new CustomEvent('navigate-to-request', { detail: { id: data.requestId } }));
          }
        } else if (action === 'accept') {
          // Handle approval logic here
          console.log('Approving working hours request:', data.requestId);
          window.dispatchEvent(new CustomEvent('approve-working-hours-request', { 
            detail: { requestId: data.requestId, notification: currentNotification } 
          }));
        } else if (action === 'reject') {
          // Handle rejection logic here  
          console.log('Rejecting working hours request:', data.requestId);
          window.dispatchEvent(new CustomEvent('reject-working-hours-request', { 
            detail: { requestId: data.requestId, notification: currentNotification } 
          }));
        }
        break;
        
      default:
        console.log('Unknown notification type:', type);
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

  const handleVerificationComplete = (result) => {
    setShowVerificationModal(false);
    
    // Có thể thực hiện các hành động khác sau khi xác minh xong
    if (result === 'approved') {
      console.log('Access log đã được phê duyệt');
    } else if (result === 'rejected') {
      console.log('Access log đã bị từ chối');
    }
    
    // Kiểm tra xem còn notification high priority nào không
    setTimeout(() => {
      const remainingHighPriority = notifications.filter(
        n => n.priority === 'high' && !n.read && !n.dismissed && n.id !== currentNotification?.id
      );
      
      if (remainingHighPriority.length > 0) {
        // Còn thông báo quan trọng khác, hiển thị tiếp
        setCurrentNotification(remainingHighPriority[0]);
        setIsVisible(true);
      } else {
        // Không còn thông báo quan trọng nào, tắt luôn popup
        setCurrentNotification(null);
        setIsVisible(false);
      }
    }, 500);
  };

  const renderActionButtons = () => {
    if (!currentNotification) return null;

    const { type } = currentNotification;

    switch (type) {
      case 'access_log_verification':
        return (
          <div className="verification-actions">
            <Button type="primary" onClick={handleView}>
              Xác minh chi tiết
            </Button>
          </div>
        );
        
      case 'unknown_vehicle_access':
        return (
          <div className="verification-actions">
            <Button type="primary" onClick={handleView}>
              Xem chi tiết
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
      case 'unknown_vehicle_access':
        return 'high-priority-notification-popup unknown-vehicle-notification';
      case 'access_log_verification':
        return 'high-priority-notification-popup access-verification-notification';
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
      maskClosable={!(currentNotification.type === 'unknown_vehicle_access' || currentNotification.type === 'access_log_verification')}
      closable={!(currentNotification.type === 'unknown_vehicle_access' || currentNotification.type === 'access_log_verification')}
      className={getModalClassName()}
      style={{
        zIndex: 9999
      }}
    >
      <div style={{ marginTop: 16 }}>
        <Alert
          message="Thông báo ưu tiên cao"
          description={currentNotification.message}
          type={currentNotification.type === 'unknown_vehicle_access' ? 'error' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Hiển thị thêm thông tin chi tiết nếu có */}
        {currentNotification.data && (
          <div className="notification-details">
            <Text strong>Thông tin chi tiết:</Text>
            <div style={{ marginTop: 8 }}>
              {currentNotification.type === 'access_log_verification' && (
                <>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Chủ xe: </Text><Text>{currentNotification.data.owner?.name || 'N/A'}</Text></div>
                  <div><Text>Đơn vị: </Text><Text>{currentNotification.data.owner?.department?.name || 'N/A'}</Text></div>
                  <div><Text>Cổng: </Text><Text code>{currentNotification.data.gateName || currentNotification.data.gateId}</Text></div>
                  <div><Text>Hành động: </Text><Text code>{currentNotification.data.action === 'entry' ? 'Vào' : 'Ra'}</Text></div>
                  <div><Text>Độ tin cậy: </Text>
                    <Text code style={{ 
                      color: currentNotification.data.confidence >= 0.8 ? '#52c41a' : 
                             currentNotification.data.confidence >= 0.6 ? '#fa8c16' : '#ff4d4f' 
                    }}>
                      {Math.round((currentNotification.data.confidence || 0) * 100)}%
                    </Text>
                  </div>
                  <div><Text>Xe đã đăng ký: </Text>
                    <Text style={{ color: currentNotification.data.isVehicleRegistered ? '#52c41a' : '#ff4d4f' }}>
                      {currentNotification.data.isVehicleRegistered ? 'Có' : 'Không'}
                    </Text>
                  </div>
                </>
              )}
              
              {currentNotification.type === 'unknown_vehicle_access' && (
                <>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Hành động: </Text><Text code>{currentNotification.data.action === 'entry' ? 'Vào' : 'Ra'}</Text></div>
                  <div><Text>Cổng: </Text><Text code>{currentNotification.data.gateName || currentNotification.data.gateId}</Text></div>
                  <div><Text>Độ tin cậy: </Text><Text code>{Math.round((currentNotification.data.confidence || 0) * 100)}%</Text></div>
                  <div><Text>Trạng thái: </Text><Text type="danger">Xe chưa đăng ký</Text></div>
                </>
              )}
              
              {currentNotification.type === 'working_hours_request' && (
                <>
                  <div><Text>Người yêu cầu: </Text><Text code>{currentNotification.data.requesterName || currentNotification.data.username}</Text></div>
                  <div><Text>Biển số: </Text><Text code>{currentNotification.data.licensePlate}</Text></div>
                  <div><Text>Loại: </Text><Text code>Yêu cầu ra/vào</Text></div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="notification-actions">
          {renderActionButtons()}
        </div>
      </div>
      
      {/* Modal xác minh chi tiết cho access log */}
      <AccessLogVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        accessLogData={currentNotification?.data}
        onVerificationComplete={handleVerificationComplete}
      />
    </Modal>
  );
};

export default HighPriorityNotificationPopup;
