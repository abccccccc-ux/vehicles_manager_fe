import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Spin,
  Button,
  Space,
  message,
  Row,
  Col,
  Card,
  Tabs,
  Image,
  Divider,
} from "antd";
import {
  CheckOutlined,
  StopOutlined,
  EyeOutlined,
  CarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { updateViolationStatus } from "../../api/workingHoursViolationApi";

const WorkingHoursViolationDetailsDialog = ({
  open,
  onClose,
  violation,
  loading,
}) => {
  if (!violation && !loading) return null;

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateViolationStatus(violation._id, {
        verificationStatus: newStatus,
      });
      message.success("Cập nhật trạng thái thành công");
      onClose();
      // Optionally refresh the table here
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const renderViolationType = (type) => {
    const violationTypes = {
      entry: "Vào",
      exit: "Ra",
    };
    return violationTypes[type] || type;
  };

  const renderSeverity = (severity) => {
    const colors = {
      low: "green",
      medium: "orange",
      high: "red",
      critical: "purple",
    };
    const labels = {
      low: "Nhẹ",
      medium: "Vừa",
      high: "Nặng",
      critical: "Rất nặng",
    };
    return (
      <Tag color={colors[severity] || "default"}>
        {labels[severity] || severity}
      </Tag>
    );
  };

  const renderStatus = (status) => {
    const colors = {
      pending: "gold",
      auto_approved: "green",
      approved: "red",
    };
    const labels = {
      pending: "Chờ xác minh",
      auto_approved: "Tự động xác minh",
      approved: "Đã xác minh",
    };
    return (
      <Tag color={colors[status] || "default"}>{labels[status] || status}</Tag>
    );
  };

  const Footer = () => {
    if (loading || !violation) return null;

    // Sử dụng verificationStatus thay vì status
    if (violation.verificationStatus === "pending") {
      return (
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleStatusUpdate("verified")}
          >
            Xác minh
          </Button>
          <Button
            danger
            icon={<StopOutlined />}
            onClick={() => handleStatusUpdate("rejected")}
          >
            Từ chối
          </Button>
        </Space>
      );
    }

    return <Button onClick={onClose}>Đóng</Button>;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={<Footer />}
      width={1000}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          Chi tiết vi phạm giờ làm việc
        </div>
      }
      closeIcon={<CloseOutlined />}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : violation ? (
        <div>
          <Row gutter={[16, 16]}>
            {/* Thông tin vi phạm chính */}
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                    Thông tin vi phạm
                  </div>
                }
                size="small"
                extra={renderStatus(
                  violation.verificationStatus || violation.status
                )}
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="ID Vi phạm">
                    <code>{violation._id}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="Biển số xe">
                    <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      {violation.licensePlate}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại vi phạm">
                    <Tag color="red">
                      {renderViolationType(violation.action)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mức độ vi phạm">
                    {renderSeverity(violation.severity)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian vi phạm">
                    <strong style={{ color: "#ff4d4f" }}>
                      {new Date(
                        violation.createdAt || violation.violationTime
                      ).toLocaleString("vi-VN")}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cổng phát hiện">
                    <strong>{violation.gateName || "N/A"}</strong>
                    {violation.gateId && (
                      <span style={{ color: "#666" }}>
                        {" "}
                        ({violation.gateId})
                      </span>
                    )}
                  </Descriptions.Item>
                  {violation.lateMinutes && (
                    <Descriptions.Item label="Số phút đi muộn">
                      <Tag color="orange">{violation.lateMinutes} phút</Tag>
                    </Descriptions.Item>
                  )}
                  {violation.earlyMinutes && (
                    <Descriptions.Item label="Số phút về sớm">
                      <Tag color="orange">{violation.earlyMinutes} phút</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            {/* Thông tin xe */}
            {violation.vehicle && (
              <Col span={12}>
                <Card
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <CarOutlined />
                      Thông tin xe đăng ký
                    </div>
                  }
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID Xe">
                      <code>{violation.vehicle._id}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Biển số xe">
                      <strong>{violation.vehicle.licensePlate}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên xe">
                      {violation.vehicle.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại xe">
                      <Tag color="blue">
                        {violation.vehicle.vehicleType === "car"
                          ? "Xe ô tô"
                          : "Xe máy"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Màu xe">
                      {violation.vehicle.color}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID Chủ xe">
                      <code>{violation.vehicle.owner}</code>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin chủ xe/người điều khiển */}
            {(violation.owner || violation.driver) && (
              <Col span={12}>
                <Card
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <UserOutlined />
                      Thông tin{" "}
                      {violation.owner ? "chủ xe" : "người điều khiển"}
                    </div>
                  }
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID">
                      <code>{(violation.owner || violation.driver)?._id}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên">
                      <strong>
                        {(violation.owner || violation.driver)?.name}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Username">
                      {(violation.owner || violation.driver)?.username}
                    </Descriptions.Item>
                    {(violation.owner || violation.driver)?.department && (
                      <Descriptions.Item label="ID Phòng ban">
                        <code>
                          {(violation.owner || violation.driver).department}
                        </code>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin đơn vị */}
            {violation.department && (
              <Col span={24}>
                <Card
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <InfoCircleOutlined />
                      Thông tin đơn vị
                    </div>
                  }
                  size="small"
                >
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Tên đơn vị">
                      <strong>{violation.department.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã đơn vị">
                      {violation.department.code}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                      {violation.department.description || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Thông tin xử lý */}
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ClockCircleOutlined />
                    Thông tin xử lý
                  </div>
                }
                size="small"
              >
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Thời gian tạo">
                    {new Date(violation.createdAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật cuối">
                    {new Date(violation.updatedAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                  {violation.processedBy && (
                    <Descriptions.Item label="Người xử lý">
                      <strong>{violation.processedBy.name}</strong>
                    </Descriptions.Item>
                  )}
                  {violation.processedAt && (
                    <Descriptions.Item label="Thời gian xử lý">
                      {new Date(violation.processedAt).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                  )}
                  {violation.notes && (
                    <Descriptions.Item label="Ghi chú" span={2}>
                      <div
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        {violation.notes}
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            {/* Thông tin hình ảnh/video nếu có */}
            {violation.recognitionData && (
              <Col span={24}>
                <Card title="Thông tin nhận diện" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Độ tin cậy">
                          <strong
                            style={{
                              color:
                                violation.recognitionData.confidence >= 0.8
                                  ? "green"
                                  : violation.recognitionData.confidence >=
                                    0.6
                                  ? "orange"
                                  : "red",
                            }}
                          >
                            {Math.round(
                              violation.recognitionData.confidence * 100
                            )}
                            %
                          </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian xử lý">
                          {violation.recognitionData.processingTime}ms
                        </Descriptions.Item>
                        <Descriptions.Item label="Media có sẵn">
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {violation.recognitionData.processedImage && (
                              <Tag color="blue">Ảnh xử lý</Tag>
                            )}
                            {violation.recognitionData.originalImage && (
                              <Tag color="green">Ảnh gốc</Tag>
                            )}
                            {violation.recognitionData.videoUrl && (
                              <Tag color="purple">Video</Tag>
                            )}
                            {!violation.recognitionData.processedImage &&
                              !violation.recognitionData.originalImage &&
                              !violation.recognitionData.videoUrl && (
                                <Tag color="default">Không có media</Tag>
                              )}
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí nhận diện" span={2}>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                            }}
                          >
                            <div>
                              X:{" "}
                              <strong>
                                {violation.recognitionData.boundingBox?.x}
                              </strong>{" "}
                              px
                            </div>
                            <div>
                              Y:{" "}
                              <strong>
                                {violation.recognitionData.boundingBox?.y}
                              </strong>{" "}
                              px
                            </div>
                            <div>
                              Chiều rộng:{" "}
                              <strong>
                                {
                                  violation.recognitionData.boundingBox
                                    ?.width
                                }
                              </strong>{" "}
                              px
                            </div>
                            <div>
                              Chiều cao:{" "}
                              <strong>
                                {
                                  violation.recognitionData.boundingBox
                                    ?.height
                                }
                              </strong>{" "}
                              px
                            </div>
                            <div>
                              Diện tích:{" "}
                              <strong>
                                {(violation.recognitionData.boundingBox
                                  ?.width || 0) *
                                  (violation.recognitionData.boundingBox
                                    ?.height || 0)}
                              </strong>{" "}
                              px²
                            </div>
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    {(violation.recognitionData.processedImage ||
                      violation.recognitionData.originalImage ||
                      violation.recognitionData.videoUrl) && (
                      <Col span={12}>
                        <div>
                          <p>
                            <strong>Media Files:</strong>
                          </p>
                          <Tabs
                            defaultActiveKey={
                              violation.recognitionData.processedImage
                                ? "1"
                                : violation.recognitionData.originalImage
                                ? "2"
                                : "3"
                            }
                            size="small"
                          >
                            {violation.recognitionData.processedImage && (
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
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginBottom: 8,
                                    }}
                                  >
                                    Đường dẫn:{" "}
                                    {
                                      violation.recognitionData
                                        .processedImage
                                    }
                                  </p>
                                  <Image
                                    width="100%"
                                    src={`${process.env.REACT_APP_IMAGE_BASE_URL}${violation.recognitionData.processedImage}`}
                                    alt="Processed image"
                                    style={{
                                      border: "1px solid #d9d9d9",
                                      borderRadius: 4,
                                    }}
                                    placeholder={
                                      <div
                                        style={{
                                          height: 150,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#f5f5f5",
                                        }}
                                      >
                                        <EyeOutlined
                                          style={{
                                            fontSize: 20,
                                            color: "#999",
                                          }}
                                        />
                                      </div>
                                    }
                                  />
                                </div>
                              </Tabs.TabPane>
                            )}

                            {violation.recognitionData.originalImage && (
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
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginBottom: 8,
                                    }}
                                  >
                                    Đường dẫn:{" "}
                                    {
                                      violation.recognitionData
                                        .originalImage
                                    }
                                  </p>
                                  <Image
                                    width="100%"
                                    src={`${process.env.REACT_APP_IMAGE_BASE_URL}${violation.recognitionData.originalImage}`}
                                    alt="Original image"
                                    style={{
                                      border: "1px solid #d9d9d9",
                                      borderRadius: 4,
                                    }}
                                    placeholder={
                                      <div
                                        style={{
                                          height: 150,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#f5f5f5",
                                        }}
                                      >
                                        <EyeOutlined
                                          style={{
                                            fontSize: 20,
                                            color: "#999",
                                          }}
                                        />
                                      </div>
                                    }
                                  />
                                </div>
                              </Tabs.TabPane>
                            )}

                            {violation.recognitionData.videoUrl && (
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
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginBottom: 8,
                                    }}
                                  >
                                    Đường dẫn:{" "}
                                    {violation.recognitionData.videoUrl}
                                  </p>
                                  <video
                                    width="100%"
                                    controls
                                    preload="metadata"
                                    style={{
                                      border: "1px solid #d9d9d9",
                                      borderRadius: 4,
                                      maxHeight: "300px",
                                    }}
                                    poster={
                                      violation.recognitionData
                                        .processedImage
                                        ? `${process.env.REACT_APP_IMAGE_BASE_URL}${violation.recognitionData.processedImage}`
                                        : undefined
                                    }
                                  >
                                    <source
                                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${violation.recognitionData.videoUrl}`}
                                      type="video/mp4"
                                    />
                                    <source
                                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${violation.recognitionData.videoUrl}`}
                                      type="video/webm"
                                    />
                                    <source
                                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${violation.recognitionData.videoUrl}`}
                                      type="video/ogg"
                                    />
                                    Trình duyệt của bạn không hỗ trợ video
                                    HTML5.
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
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <InfoCircleOutlined
            style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}
          />
          <div>Không có dữ liệu vi phạm</div>
        </div>
      )}
    </Modal>
  );
};

export default WorkingHoursViolationDetailsDialog;
