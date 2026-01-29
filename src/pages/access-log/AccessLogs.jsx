import React, { useEffect } from 'react';
import { Card, Typography, Space, Button, Tooltip } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import AccessLogTable from './AccessLogTable';
import { fetchAccessLogs } from '../../store/accessLogSlice';
import { useAccessLogs } from '../../hooks/useAccessLogs';
import notificationService from '../../services/notificationService';

const { Title, Text } = Typography;

const AccessLogs = () => {
  const dispatch = useDispatch();
  const { refreshAccessLogs } = useAccessLogs();

  useEffect(() => {
    // Listen for vehicle access notifications để auto refresh
    const handleVehicleAccess = (eventData) => {
      console.log('🚗 Vehicle access detected, refreshing access logs table...');
      // Table sẽ tự động refresh thông qua notificationService -> accessLogService
      // Nhưng cũng có thể refresh manual ở đây nếu cần
    };

    notificationService.on('vehicle_access', handleVehicleAccess);

    return () => {
      notificationService.off('vehicle_access', handleVehicleAccess);
    };
  }, []);

  const handleRefresh = () => {
    // Manual refresh
    dispatch(fetchAccessLogs({
      page: 1,
      limit: 10
    }));
    // refreshAccessLogs();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <Space direction="vertical" size={0}>
            <Title level={3} style={{ margin: 0 }}>
              Lịch sử Ra/Vào
            </Title>
            <Text type="secondary">
              Quản lý và theo dõi lịch sử ra/vào của các phương tiện
            </Text>
          </Space>
          
          <Space>
            <Tooltip title="Làm mới dữ liệu">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                type="default"
              >
                Làm mới
              </Button>
            </Tooltip>
          </Space>
        </div>

        <AccessLogTable />
      </Card>
    </div>
  );
};

export default AccessLogs;
