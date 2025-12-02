import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNotificationContext } from './NotificationProvider';

const NotificationStatus = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { 
    isConnected, 
    isAuthenticated: isNotificationAuth, 
    authError, 
    reconnect 
  } = useNotificationContext();
  
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (isConnected && isNotificationAuth) return '#4caf50';
    if (isConnected && !isNotificationAuth) return '#ff9800';
    return '#f44336';
  };

  const getStatusText = () => {
    if (!isAuthenticated) return 'Chưa đăng nhập';
    if (isConnected && isNotificationAuth) return 'Đã kết nối & xác thực';
    if (isConnected && !isNotificationAuth) return 'Đã kết nối, chưa xác thực';
    return 'Chưa kết nối';
  };

  const handleReconnect = () => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      const userInfo = {
        id: user.id,
        userId: user.id,
        username: user.username,
        role: user.role,
        departmentId: user.departmentId,
        department: user.department
      };
      
      reconnect(token, userInfo);
    }
  };

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '4px',
      margin: '10px 0' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div 
          style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: getStatusColor() 
          }}
        />
        <span style={{ fontWeight: 'bold' }}>Trạng thái thông báo:</span>
        <span>{getStatusText()}</span>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{ 
            marginLeft: 'auto', 
            padding: '2px 8px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? 'Ẩn' : 'Chi tiết'}
        </button>
      </div>

      {showDetails && (
        <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.5' }}>
          <div><strong>Kết nối:</strong> {isConnected ? '✅ Có' : '❌ Không'}</div>
          <div><strong>Xác thực:</strong> {isNotificationAuth ? '✅ Có' : '❌ Không'}</div>
          {user && (
            <>
              <div><strong>Người dùng:</strong> {user.username}</div>
              <div><strong>Vai trò:</strong> {user.role}</div>
              {user.department && (
                <div><strong>Phòng ban:</strong> {user.department.name}</div>
              )}
            </>
          )}
          
          {authError && (
            <div style={{ color: '#f44336', marginTop: '5px' }}>
              <strong>Lỗi xác thực:</strong> {authError.error || 'Unknown error'}
            </div>
          )}
          
          {isAuthenticated && (!isConnected || !isNotificationAuth) && (
            <button 
              onClick={handleReconnect}
              style={{ 
                marginTop: '8px',
                padding: '5px 10px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Kết nối lại
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationStatus;
