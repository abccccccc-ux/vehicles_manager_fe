import React, { useState } from 'react';
import { Card, Button, notification, Space } from 'antd';
import cameraApi from '../api/cameraApi';

const ApiTest = () => {
  const [loading, setLoading] = useState(false);

  const testCreateCamera = async () => {
    setLoading(true);
    
    const testData = {
      cameraId: "TEST_CAM_001",
      name: "Camera Test API",
      description: "Camera test cho API mới",
      location: {
        gateId: "gate_001",
        gateName: "Cổng Test",
        position: "entry",
        coordinates: {
          latitude: 21.0285,
          longitude: 105.8542
        }
      },
      technical: {
        ipAddress: "192.168.1.100",
        port: 8080,
        protocol: "http",
        username: "admin",
        password: "testpassword123",
        streamUrl: "rtsp://192.168.1.100:554/stream",
        resolution: {
          width: 1920,
          height: 1080
        },
        fps: 30
      },
      recognition: {
        enabled: true,
        confidence: {
          threshold: 0.8,
          autoApprove: 0.9
        },
        roi: {
          x: 100,
          y: 150,
          width: 800,
          height: 600
        },
        processingInterval: 1000
      },
      manufacturer: "Hikvision",
      model: "DS-2CD2143G0-I",
      serialNumber: "SN123456789",
      warrantyExpiry: "2025-12-31"
    };

    try {
      const response = await cameraApi.createCamera(testData);
      console.log('Create response:', response);
      notification.success({
        message: 'Tạo camera thành công!',
        description: `Response: ${JSON.stringify(response.data, null, 2)}`,
        placement: 'topRight',
        duration: 10
      });
    } catch (error) {
      console.error('Create error:', error);
      notification.error({
        message: 'Lỗi tạo camera',
        description: error.response?.data?.message || error.message,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpdateCamera = async () => {
    setLoading(true);
    
    const updateData = {
      name: "Camera Cổng Chính Mới - Updated",
      description: "Camera giám sát cổng chính đã được nâng cấp - Updated",
      location: {
        gateId: "gate_001",
        gateName: "Cổng Chính Updated",
        position: "entry",
        coordinates: {
          latitude: 21.0285,
          longitude: 105.8542
        }
      },
      technical: {
        ipAddress: "192.168.1.100",
        port: 8080,
        protocol: "http",
        username: "admin",
        password: "newpassword123",
        streamUrl: "rtsp://192.168.1.100:554/stream",
        resolution: {
          width: 1920,
          height: 1080
        },
        fps: 30
      },
      recognition: {
        enabled: true,
        confidence: {
          threshold: 0.8,
          autoApprove: 0.9
        },
        roi: {
          x: 100,
          y: 150,
          width: 800,
          height: 600
        },
        processingInterval: 1000
      },
      manufacturer: "Hikvision",
      model: "DS-2CD2143G0-I",
      serialNumber: "SN123456789",
      warrantyExpiry: "2025-12-31"
    };

    try {
      // Thay CAMERA_ID bằng ID thực tế
      const response = await cameraApi.updateCamera('TEST_CAM_001', updateData);
      console.log('Update response:', response);
      notification.success({
        message: 'Cập nhật camera thành công!',
        description: `Response: ${JSON.stringify(response.data, null, 2)}`,
        placement: 'topRight',
        duration: 10
      });
    } catch (error) {
      console.error('Update error:', error);
      notification.error({
        message: 'Lỗi cập nhật camera',
        description: error.response?.data?.message || error.message,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetCameras = async () => {
    setLoading(true);
    
    try {
      const response = await cameraApi.getAllCameras();
      console.log('Get all cameras response:', response);
      notification.success({
        message: 'Lấy danh sách camera thành công!',
        description: `Tìm thấy ${response.data?.length || 0} camera`,
        placement: 'topRight'
      });
    } catch (error) {
      console.error('Get cameras error:', error);
      notification.error({
        message: 'Lỗi lấy danh sách camera',
        description: error.response?.data?.message || error.message,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="🧪 Camera API Test" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          <div>
            <h4>Test API Endpoints:</h4>
            <p>Base URL: {process.env.REACT_APP_API_BASE_URL || 'https://vehicle-manage.vercel.app/api'}</p>
          </div>

          <Space wrap>
            <Button 
              type="primary" 
              onClick={testCreateCamera}
              loading={loading}
            >
              🆕 Test Create Camera
            </Button>
            
            <Button 
              onClick={testUpdateCamera}
              loading={loading}
            >
              ✏️ Test Update Camera
            </Button>
            
            <Button 
              onClick={testGetCameras}
              loading={loading}
            >
              📋 Test Get Cameras
            </Button>
          </Space>

          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h5>📝 Lưu ý:</h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Kiểm tra Console để xem response đầy đủ</li>
              <li>Đảm bảo đã đăng nhập để có JWT token</li>
              <li>API sẽ gửi theo format của curl command đã cung cấp</li>
              <li>Update test sử dụng camera ID: TEST_CAM_001</li>
            </ul>
          </div>

        </Space>
      </Card>
    </div>
  );
};

export default ApiTest;
