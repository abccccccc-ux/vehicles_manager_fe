import React from 'react';
import { Modal, Descriptions, Tag, Image, Spin, Row, Col, Card } from 'antd';
import { CloseOutlined, EyeOutlined, CarOutlined, UserOutlined } from '@ant-design/icons';

const AccessLogDetailsDialog = ({ open, onClose, accessLog, loading }) => {
  if (!accessLog && !loading) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      verified: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác minh',
      verified: 'Đã xác minh',
      rejected: 'Từ chối'
    };
    return labels[status] || status;
  };

  const getActionLabel = (action) => {
    return action === 'entry' ? 'Vào' : 'Ra';
  };

  const getVehicleTypeLabel = (type) => {
    return type === 'car' ? 'Xe ô tô' : type === 'motorbike' ? 'Xe máy' : type;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EyeOutlined />
          Chi tiết Log Ra/Vào
        </div>
      }
      closeIcon={<CloseOutlined />}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div>
          <Row gutter={[16, 16]}>
            {/* Thông tin chính */}
            <Col span={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CarOutlined />
                    Thông tin xe
                  </div>
                }
                size="small"
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Biển số">
                    <strong style={{ fontSize: '16px', color: '#1890ff' }}>
                      {accessLog.licensePlate}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hành động">
                    <Tag color={accessLog.action === 'entry' ? 'blue' : 'orange'}>
                      {getActionLabel(accessLog.action)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cổng">
                    <strong>{accessLog.gateName}</strong> ({accessLog.gateId})
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian">
                    {new Date(accessLog.createdAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái xác minh" span={2}>
                    <Tag color={getStatusColor(accessLog.verificationStatus)}>
                      {getStatusLabel(accessLog.verificationStatus)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Thông tin xe */}
            {accessLog.vehicle && (
              <Col span={12}>
                <Card 
                  title="Thông tin xe đăng ký"
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên xe">
                      {accessLog.vehicle.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại xe">
                      {getVehicleTypeLabel(accessLog.vehicle.vehicleType)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Màu xe">
                      {accessLog.vehicle.color}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đăng ký">
                      <Tag color={accessLog.isVehicleRegistered ? 'green' : 'red'}>
                        {accessLog.isVehicleRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin chủ xe */}
            {accessLog.owner && (
              <Col span={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserOutlined />
                      Thông tin chủ xe
                    </div>
                  }
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên">
                      {accessLog.owner.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Username">
                      {accessLog.owner.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái tài khoản">
                      <Tag color={accessLog.isOwnerActive ? 'green' : 'red'}>
                        {accessLog.isOwnerActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin nhận diện */}
            {accessLog.recognitionData && (
              <Col span={24}>
                <Card title="Thông tin nhận diện" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Độ tin cậy">
                          <strong style={{ 
                            color: accessLog.recognitionData.confidence >= 0.8 ? 'green' : 
                                   accessLog.recognitionData.confidence >= 0.6 ? 'orange' : 'red'
                          }}>
                            {Math.round(accessLog.recognitionData.confidence * 100)}%
                          </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian xử lý">
                          {accessLog.recognitionData.processingTime}ms
                        </Descriptions.Item>
                        <Descriptions.Item label="Bounding Box">
                          x: {accessLog.recognitionData.boundingBox?.x}, 
                          y: {accessLog.recognitionData.boundingBox?.y}, 
                          w: {accessLog.recognitionData.boundingBox?.width}, 
                          h: {accessLog.recognitionData.boundingBox?.height}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    {accessLog.recognitionData.processedImage && (
                      <Col span={12}>
                        <div>
                          <p><strong>Ảnh đã xử lý:</strong></p>
                          <Image
                            width="100%"
                            src={accessLog.recognitionData.processedImage}
                            alt="Processed image"
                            style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}
                            placeholder={
                              <div style={{ 
                                height: 100, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5'
                              }}>
                                <EyeOutlined style={{ fontSize: 20, color: '#999' }} />
                              </div>
                            }
                          />
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      )}
    </Modal>
  );
};

export default AccessLogDetailsDialog;
