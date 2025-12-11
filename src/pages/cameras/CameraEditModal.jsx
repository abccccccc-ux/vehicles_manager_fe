import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Row, Col, notification } from 'antd';
import cameraApi from '../../api/cameraApi';
import { safeDisplayPassword } from '../../utils/cryptoUtils';

const { Option } = Select;
const { TextArea } = Input;

const CameraEditModal = ({ visible, camera, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (visible && camera) {
      // Edit mode - populate form with camera data
      const loadCameraData = async () => {
        setLoadingPassword(true);
        
        let decryptedPassword = "";
        if (camera.technical?.password) {
          try {
            decryptedPassword = await safeDisplayPassword(camera.technical.password);
          } catch (error) {
            console.error('Error decrypting password:', error);
            notification.warning({ 
              message: 'Không thể giải mã mật khẩu đã lưu', 
              description: 'Vui lòng nhập lại mật khẩu',
              placement: 'bottomRight' 
            });
          }
        }
        
        form.setFieldsValue({
          cameraId: camera.cameraId,
          name: camera.name,
          gateId: camera.location?.gateId,
          gateName: camera.location?.gateName,
          position: camera.location?.position,
          latitude: camera.location?.coordinates?.latitude,
          longitude: camera.location?.coordinates?.longitude,
          ipAddress: camera.technical?.ipAddress,
          port: camera.technical?.port,
          protocol: camera.technical?.protocol,
          username: camera.technical?.username,
          password: decryptedPassword, // Show decrypted password when editing
          fps: camera.technical?.fps,
          width: camera.technical?.resolution?.width,
          height: camera.technical?.resolution?.height,
          description: camera.description,
          recognitionEnabled: camera.recognition?.enabled,
          threshold: camera.recognition?.confidence?.threshold,
          autoApprove: camera.recognition?.confidence?.autoApprove,
          roiX: camera.recognition?.roi?.x,
          roiY: camera.recognition?.roi?.y,
          roiWidth: camera.recognition?.roi?.width,
          roiHeight: camera.recognition?.roi?.height,
          processingInterval: camera.recognition?.processingInterval,
          manufacturer: camera.manufacturer,
          model: camera.model,
          serialNumber: camera.serialNumber,
          warrantyExpiry: camera.warrantyExpiry ? camera.warrantyExpiry.split('T')[0] : null, // Format date for input
        });
        
        setLoadingPassword(false);
      };
      
      loadCameraData();
    } else if (visible && !camera) {
      // Create mode - reset form
      form.resetFields();
      setLoadingPassword(false);
    }
  }, [visible, camera, form]);

  const handleSubmit = async (values) => {
    const cameraData = {
      name: values.name,
      description: values.description || "",
      location: {
        gateId: values.gateId,
        gateName: values.gateName,
        position: values.position,
        coordinates: {
          latitude: values.latitude || 21.0285,
          longitude: values.longitude || 105.8542
        }
      },
      technical: {
        ipAddress: values.ipAddress,
        port: values.port,
        protocol: values.protocol,
        username: values.username,
        password: values.password,
        streamUrl: `${values.protocol}://${values.ipAddress}:${values.port}/stream`,
        resolution: {
          width: values.width,
          height: values.height,
        },
        fps: values.fps,
      },
      recognition: {
        enabled: values.recognitionEnabled,
        confidence: {
          threshold: values.threshold,
          autoApprove: values.autoApprove,
        },
        roi: {
          x: values.roiX || 100,
          y: values.roiY || 150,
          width: values.roiWidth || 800,
          height: values.roiHeight || 600
        },
        processingInterval: values.processingInterval || 1000
      },
      manufacturer: values.manufacturer,
      model: values.model,
      serialNumber: values.serialNumber,
      warrantyExpiry: values.warrantyExpiry
    };

    // Thêm cameraId khi tạo mới
    if (!camera) {
      cameraData.cameraId = values.cameraId;
    }

    console.log("Submitting camera data:", cameraData);

    try {
      let response;

      if (camera) {
        // Update existing camera - sử dụng cameraId thay vì _id
        const updateId = camera._id;
        response = await cameraApi.updateCamera(updateId, cameraData);
        if (response && response.success) {
          notification.success({ message: response.message || "Đã cập nhật camera thành công", placement: 'bottomRight' });
        } else {
          notification.success({ message: "Đã cập nhật camera thành công", placement: 'bottomRight' });
        }
      } else {
        // Create new camera
        response = await cameraApi.createCamera(cameraData);
        if (response && response.success) {
          notification.success({ message: response.message || "Đã thêm camera thành công", placement: 'bottomRight' });
        } else {
          notification.success({ message: "Đã thêm camera thành công", placement: 'bottomRight' });
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Error submitting camera:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 404) {
        notification.warning({
          message: `API ${camera ? "cập nhật" : "tạo"} camera chưa được triển khai`,
          placement: 'bottomRight'
        });
      } else if (error.response?.status === 401) {
        notification.error({ message: "Không có quyền thực hiện thao tác này", placement: 'bottomRight' });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Dữ liệu không hợp lệ";
        notification.error({ message: errorMessage, placement: 'bottomRight' });
      } else {
        notification.error({
          message: camera ? "Không thể cập nhật camera" : "Không thể thêm camera",
          placement: 'bottomRight'
        });
      }
    }
  };

  return (
    <Modal
      title={camera ? "Chỉnh sửa Camera" : "Thêm Camera mới"}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={800}
      okText={camera ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          protocol: "rtsp",
          port: 554,
          fps: 30,
          width: 1920,
          height: 1080,
          recognitionEnabled: true,
          threshold: 0.8,
          autoApprove: 0.9,
          position: "entry",
          latitude: 21.0285,
          longitude: 105.8542,
          roiX: 100,
          roiY: 150,
          roiWidth: 800,
          roiHeight: 600,
          processingInterval: 1000,
          manufacturer: "Hikvision",
          model: "DS-2CD2143G0-I",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cameraId"
              label="ID Camera"
              rules={[
                { required: true, message: "Vui lòng nhập ID camera" },
              ]}
            >
              <Input placeholder="camera1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên Camera"
              rules={[
                { required: true, message: "Vui lòng nhập tên camera" },
              ]}
            >
              <Input placeholder="Camera Cổng chính" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gateId"
              label="ID Cổng"
              rules={[{ required: true, message: "Vui lòng nhập ID cổng" }]}
            >
              <Input placeholder="GATE_1" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="gateName"
              label="Tên Cổng"
              rules={[
                { required: true, message: "Vui lòng nhập tên cổng" },
              ]}
            >
              <Input placeholder="Cổng 1" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="position"
              label="Vị trí"
              rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
            >
              <Select placeholder="Chọn vị trí">
                <Option value="entry">Lối vào</Option>
                <Option value="exit">Lối ra</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ipAddress"
              label="Địa chỉ IP"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ IP" },
                {
                  pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
                  message: "Địa chỉ IP không hợp lệ",
                },
              ]}
            >
              <Input placeholder="192.168.1.64" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="port"
              label="Cổng"
              rules={[{ required: true, message: "Vui lòng nhập cổng" }]}
            >
              <InputNumber min={1} max={65535} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="protocol"
              label="Giao thức"
              rules={[
                { required: true, message: "Vui lòng chọn giao thức" },
              ]}
            >
              <Select>
                <Option value="rtsp">RTSP</Option>
                <Option value="http">HTTP</Option>
                <Option value="https">HTTPS</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input placeholder="admin" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
              ]}
            >
              <Input.Password 
                placeholder="Mật khẩu camera" 
                loading={loadingPassword}
                disabled={loadingPassword}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="fps"
              label="FPS"
              rules={[{ required: true, message: "Vui lòng nhập FPS" }]}
            >
              <InputNumber min={1} max={60} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="width"
              label="Độ rộng"
              rules={[{ required: true, message: "Vui lòng nhập độ rộng" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="height"
              label="Độ cao"
              rules={[{ required: true, message: "Vui lòng nhập độ cao" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Mô tả camera..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="recognitionEnabled"
              label="Kích hoạt nhận diện"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="autoApprove"
              label="Tự động phê duyệt"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập ngưỡng tự động phê duyệt",
                },
              ]}
            >
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CameraEditModal;
