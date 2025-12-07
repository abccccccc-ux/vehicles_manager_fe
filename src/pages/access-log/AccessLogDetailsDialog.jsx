import React from 'react';
import { Modal, Descriptions, Tag, Image, Spin, Row, Col, Card, Tabs } from 'antd';
import { CloseOutlined, EyeOutlined, CarOutlined, UserOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons';

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
  console.log(accessLog);
  

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
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
                    Thông tin log
                  </div>
                }
                size="small"
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="ID Log">
                    <code>{accessLog.log._id}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="Biển số">
                    <strong style={{ fontSize: '16px', color: '#1890ff' }}>
                      {accessLog.log.licensePlate}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hành động">
                    <Tag color={accessLog.log.action === 'entry' ? 'blue' : 'orange'}>
                      {getActionLabel(accessLog.log.action)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cổng">
                    <strong>{accessLog.log.gateName}</strong> ({accessLog.log.gateId})
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian tạo">
                    {new Date(accessLog.log.createdAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian cập nhật">
                    {new Date(accessLog.log.updatedAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái xác minh" span={2}>
                    <Tag color={getStatusColor(accessLog.log.verificationStatus)}>
                      {getStatusLabel(accessLog.log.verificationStatus)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Thông tin xe */}
            {accessLog.log.vehicle && (
              <Col span={12}>
                <Card 
                  title="Thông tin xe đăng ký"
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID Xe">
                      <code>{accessLog.log.vehicle._id}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Biển số xe">
                      <strong>{accessLog.log.vehicle.licensePlate}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên xe">
                      {accessLog.log.vehicle.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại xe">
                      {getVehicleTypeLabel(accessLog.log.vehicle.vehicleType)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Màu xe">
                      {accessLog.log.vehicle.color}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID Chủ xe">
                      <code>{accessLog.log.vehicle.owner}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đăng ký">
                      <Tag color={accessLog.log.isVehicleRegistered ? 'green' : 'red'}>
                        {accessLog.log.isVehicleRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin chủ xe */}
            {accessLog.log.owner && (
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
                    <Descriptions.Item label="ID Chủ xe">
                      <code>{accessLog.log.owner._id}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên">
                      {accessLog.log.owner.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Username">
                      {accessLog.log.owner.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID Phòng ban">
                      <code>{accessLog.log.owner.department}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái tài khoản">
                      <Tag color={accessLog.log.isOwnerActive ? 'green' : 'red'}>
                        {accessLog.log.isOwnerActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin hệ thống */}
            <Col span={24}>
              <Card title="Thông tin hệ thống" size="small">
                <Descriptions column={2} size="large">
                  <Descriptions.Item label="Trạng thái xe đăng ký">
                    <Tag color={accessLog.log.isVehicleRegistered ? 'green' : 'red'}>
                      {accessLog.log.isVehicleRegistered ? 'Có trong hệ thống' : 'Không có trong hệ thống'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái chủ xe">
                    <Tag color={accessLog.log.isOwnerActive ? 'green' : 'red'}>
                      {accessLog.log.isOwnerActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Thông tin nhận diện */}
            {accessLog.log.recognitionData && (
              <Col span={24}>
                <Card title="Thông tin nhận diện" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Độ tin cậy">
                          <strong style={{ 
                            color: accessLog.log.recognitionData.confidence >= 0.8 ? 'green' : 
                                   accessLog.log.recognitionData.confidence >= 0.6 ? 'orange' : 'red'
                          }}>
                            {Math.round(accessLog.log.recognitionData.confidence * 100)}%
                          </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian xử lý">
                          {accessLog.log.recognitionData.processingTime}ms
                        </Descriptions.Item>
                        <Descriptions.Item label="Media có sẵn">
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {accessLog.log.recognitionData.processedImage && (
                              <Tag color="blue">Ảnh xử lý</Tag>
                            )}
                            {accessLog.log.recognitionData.originalImage && (
                              <Tag color="green">Ảnh gốc</Tag>
                            )}
                            {accessLog.log.recognitionData.videoUrl && (
                              <Tag color="purple">Video</Tag>
                            )}
                            {!accessLog.log.recognitionData.processedImage && 
                             !accessLog.log.recognitionData.originalImage && 
                             !accessLog.log.recognitionData.videoUrl && (
                              <Tag color="default">Không có media</Tag>
                            )}
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí nhận diện" span={2}>
                          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            <div>X: <strong>{accessLog.log.recognitionData.boundingBox?.x}</strong> px</div>
                            <div>Y: <strong>{accessLog.log.recognitionData.boundingBox?.y}</strong> px</div>
                            <div>Chiều rộng: <strong>{accessLog.log.recognitionData.boundingBox?.width}</strong> px</div>
                            <div>Chiều cao: <strong>{accessLog.log.recognitionData.boundingBox?.height}</strong> px</div>
                            <div>Diện tích: <strong>{(accessLog.log.recognitionData.boundingBox?.width || 0) * (accessLog.log.recognitionData.boundingBox?.height || 0)}</strong> px²</div>
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    {(accessLog.log.recognitionData.processedImage || 
                      accessLog.log.recognitionData.originalImage || 
                      accessLog.log.recognitionData.videoUrl) && (
                      <Col span={12}>
                        <div>
                          <p><strong>Media Files:</strong></p>
                          <Tabs 
                            defaultActiveKey={
                              accessLog.log.recognitionData.processedImage ? "1" : 
                              accessLog.log.recognitionData.originalImage ? "2" : "3"
                            } 
                            size="small"
                          >
                            {accessLog.log.recognitionData.processedImage && (
                              <Tabs.TabPane 
                                tab={
                                  <span>
                                    <PictureOutlined />
                                    Ảnh đã xử lý
                                  </span>
                                } 
                                key="1"
                              >
                                <div>
                                  <p style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                    Đường dẫn: {accessLog.log.recognitionData.processedImage}
                                  </p>
                                  <Image
                                    width="100%"
                                    src={`${process.env.REACT_APP_IMAGE_BASE_URL}${accessLog.log.recognitionData.processedImage}`}
                                    alt="Processed image"
                                    style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}
                                    placeholder={
                                      <div style={{ 
                                        height: 150, 
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
                              </Tabs.TabPane>
                            )}
                            
                            {accessLog.log.recognitionData.originalImage && (
                              <Tabs.TabPane 
                                tab={
                                  <span>
                                    <PictureOutlined />
                                    Ảnh gốc
                                  </span>
                                } 
                                key="2"
                              >
                                <div>
                                  <p style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                    Đường dẫn: {accessLog.log.recognitionData.originalImage}
                                  </p>
                                  <Image
                                    width="100%"
                                    src={`${process.env.REACT_APP_IMAGE_BASE_URL}${accessLog.log.recognitionData.originalImage}`}
                                    alt="Original image"
                                    style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}
                                    placeholder={
                                      <div style={{ 
                                        height: 150, 
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
                              </Tabs.TabPane>
                            )}
                            
                            {accessLog.log.recognitionData.videoUrl && (
                              <Tabs.TabPane 
                                tab={
                                  <span>
                                    <VideoCameraOutlined />
                                    Video
                                  </span>
                                } 
                                key="3"
                              >
                                <div>
                                  <p style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                    Đường dẫn: {accessLog.log.recognitionData.videoUrl}
                                  </p>
                                  <video
                                    width="100%"
                                    controls
                                    preload="metadata"
                                    style={{ border: '1px solid #d9d9d9', borderRadius: 4, maxHeight: '300px' }}
                                    poster={accessLog.log.recognitionData.processedImage ? 
                                      `${process.env.REACT_APP_IMAGE_BASE_URL}${accessLog.log.recognitionData.processedImage}` : 
                                      undefined
                                    }
                                  >
                                    <source 
                                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${accessLog.log.recognitionData.videoUrl}`} 
                                      type="video/mp4" 
                                    />
                                    <source 
                                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${accessLog.log.recognitionData.videoUrl}`} 
                                      type="video/webm" 
                                    />
                                    <source 
                                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${accessLog.log.recognitionData.videoUrl}`} 
                                      type="video/ogg" 
                                    />
                                    Trình duyệt của bạn không hỗ trợ video HTML5.
                                  </video>
                                </div>
                              </Tabs.TabPane>
                            )}
                          </Tabs>
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
