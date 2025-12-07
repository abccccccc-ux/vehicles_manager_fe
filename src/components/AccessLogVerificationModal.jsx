import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Tag,
  Space,
  Image,
  Alert,
  Divider,
  message,
  Badge,
  Progress,
  Popconfirm
} from 'antd';
import {
  CarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  TeamOutlined,
  SwapOutlined,
  PhoneOutlined,
  IdcardOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { verifyAccessLog } from '../api/accessLogApi';
import { getVehicleByLicensePlate } from '../api/vehicleApi';
import useDebounce from '../hooks/useDebounce';
import './AccessLogVerificationModal.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AccessLogVerificationModal = ({ 
  visible, 
  onClose, 
  accessLogData, 
  onVerificationComplete 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchingVehicle, setSearchingVehicle] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [licensePlateInput, setLicensePlateInput] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  // Debounce the license plate input for auto-search
  const debouncedLicensePlate = useDebounce(licensePlateInput, 1000);

  // Tìm kiếm thông tin xe theo biển số
  const handleLicensePlateSearch = useCallback(async (licensePlate) => {
    if (!licensePlate || licensePlate.trim().length < 3) {
      message.warning('Vui lòng nhập ít nhất 3 ký tự cho biển số');
      return;
    }

    try {
      setSearchingVehicle(true);
      setVehicleFound(false);
      
      const result = await getVehicleByLicensePlate(licensePlate.trim());
      
      if (result.success && result.data) {
        const vehicleData = result.data;
        
        // Tự động fill thông tin xe và chủ xe vào form
        form.setFieldsValue({
          vehicleColor: vehicleData.color || '',
          vehicleDescription: vehicleData.description || '',
          ownerName: vehicleData.owner?.name || '',
          ownerUsername: vehicleData.owner?.username || '',
          departmentName: vehicleData.owner?.department?.name || '',
        });
        
        setVehicleFound(true);
        setIsGuestMode(false);
        message.success({
          content: `Đã tìm thấy và tự động điền thông tin xe ${licensePlate}`,
          duration: 3
        });
      } else {
        setIsGuestMode(true);
        setVehicleFound(false);
        message.warning({
          content: `Không tìm thấy xe có biển số ${licensePlate}. Chuyển sang chế độ khách vãng lai`,
          duration: 4
        });
      }
    } catch (error) {
      console.error('Error searching vehicle:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm xe');
    } finally {
      setSearchingVehicle(false);
    }
  }, [form]);

  // Clear auto-filled vehicle information
  const clearVehicleInfo = () => {
    form.setFieldsValue({
      vehicleColor: '',
      vehicleDescription: '',
      ownerName: '',
      ownerUsername: '',
      departmentName: '',
    });
    setVehicleFound(false);
    message.info('Đã xóa thông tin xe tự động điền');
  };

  // Toggle between guest mode and regular mode
  const toggleGuestMode = () => {
    const newGuestMode = !isGuestMode;
    setIsGuestMode(newGuestMode);
    
    if (newGuestMode) {
      // Clear regular owner info and fill guest info fields
      form.setFieldsValue({
        ownerName: '',
        ownerUsername: '',
        departmentName: '',
        // Initialize guest info fields
        guestName: '',
        guestPhone: '',
        guestIdCard: '',
        guestHometown: '',
        guestVisitPurpose: '',
        guestContactPerson: '',
        guestNotes: ''
      });
      message.info('Đã chuyển sang chế độ khách vãng lai');
    } else {
      // Clear guest info fields
      form.setFieldsValue({
        guestName: '',
        guestPhone: '',
        guestIdCard: '',
        guestHometown: '',
        guestVisitPurpose: '',
        guestContactPerson: '',
        guestNotes: ''
      });
      message.info('Đã chuyển về chế độ chủ xe thông thường');
    }
    setVehicleFound(false);
  };

  // Auto-search when debounced license plate changes
  useEffect(() => {
    if (debouncedLicensePlate && debouncedLicensePlate.trim().length >= 3 && editMode) {
      handleLicensePlateSearch(debouncedLicensePlate);
    }
  }, [debouncedLicensePlate, editMode, handleLicensePlateSearch]);

  useEffect(() => {
    if (visible && accessLogData) {
      // Khởi tạo form với dữ liệu hiện tại
      form.setFieldsValue({
        licensePlate: accessLogData.licensePlate,
        ownerName: accessLogData.owner?.name || '',
        ownerUsername: accessLogData.owner?.username || '',
        departmentName: accessLogData.owner?.department?.name || '',
        vehicleColor: accessLogData.vehicle?.color || '',
        vehicleDescription: accessLogData.vehicle?.description || '',
        action: accessLogData.action,
        confidence: Math.round((accessLogData.confidence || 0.85) * 100), // Convert to percentage
        verificationNotes: '',
        // Guest info fields
        guestName: accessLogData.guestInfo?.name || '',
        guestPhone: accessLogData.guestInfo?.phone || '',
        guestIdCard: accessLogData.guestInfo?.idCard || '',
        guestHometown: accessLogData.guestInfo?.hometown || '',
        guestVisitPurpose: accessLogData.guestInfo?.visitPurpose || '',
        guestContactPerson: accessLogData.guestInfo?.contactPerson || '',
        guestNotes: accessLogData.guestInfo?.notes || ''
      });
      
      // Khởi tạo license plate input
      setLicensePlateInput(accessLogData.licensePlate || '');
      setVehicleFound(false);
      
      // Khởi tạo guest mode nếu có dữ liệu guest hoặc không có thông tin owner
      const hasGuestInfo = accessLogData.guestInfo && accessLogData.guestInfo.name;
      const hasOwnerInfo = accessLogData.owner && accessLogData.owner.name;
      setIsGuestMode(hasGuestInfo || !hasOwnerInfo);
      
      // Tự động bật chế độ chỉnh sửa
      setEditMode(true);
    }
  }, [visible, accessLogData, form]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      
      // Validate form before update
      try {
        await form.validateFields();
      } catch (error) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setLoading(false);
        return;
      }
      
      const formData = form.getFieldsValue();
      const verificationNotes = formData.verificationNotes || '';

      // Helper function to remove empty fields
      const removeEmptyFields = (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'object' && !Array.isArray(value)) {
              const cleanedNested = removeEmptyFields(value);
              if (Object.keys(cleanedNested).length > 0) {
                cleaned[key] = cleanedNested;
              }
            } else {
              cleaned[key] = value;
            }
          }
        });
        return cleaned;
      };

      // Chuẩn bị dữ liệu correctedData
      const correctedData = {
        licensePlate: formData.licensePlate,
        confidence: (formData.confidence || 85) / 100 // Convert to decimal, default 0.85
      };


      // Chuẩn bị dữ liệu cho API verify
      const verifyData = {
        status: 'approved',
        correctedData: correctedData
      };

      // Thêm note nếu có
      if (verificationNotes && verificationNotes.trim()) {
        verifyData.note = verificationNotes.trim();
      }

      // Nếu là chế độ khách vãng lai, thêm thông tin guest
      if (isGuestMode) {
        const guestInfo = {
          name: formData.guestName?.trim(),
          phone: formData.guestPhone?.trim(),
          idCard: formData.guestIdCard?.trim(),
          hometown: formData.guestHometown?.trim(),
          visitPurpose: formData.guestVisitPurpose?.trim(),
          contactPerson: formData.guestContactPerson?.trim(),
          notes: formData.guestNotes?.trim()
        };

        // Chỉ thêm guestInfo nếu có ít nhất một trường bắt buộc
        const cleanedGuestInfo = removeEmptyFields(guestInfo);
        if (Object.keys(cleanedGuestInfo).length > 0) {
          verifyData.guestInfo = cleanedGuestInfo;
        }
      }

      // Log dữ liệu gửi đi để debug
      console.log('Verify data to be sent:', JSON.stringify(verifyData, null, 2));
      
      // Hiển thị thông tin tóm tắt những gì sẽ được cập nhật
      const updateSummary = [];
      if (verifyData.note) updateSummary.push('ghi chú');
      if (verifyData.correctedData.action) updateSummary.push('hành động');
      if (verifyData.vehicleInfo) updateSummary.push('thông tin xe');
      if (verifyData.guestInfo) updateSummary.push('thông tin khách vãng lai');
      if (verifyData.ownerInfo) updateSummary.push('thông tin chủ xe');
      
      console.log(`Sẽ cập nhật: ${updateSummary.join(', ')}`);
      
      await verifyAccessLog(accessLogData.accessLogId, verifyData);
      
      message.success('Đã cập nhật thông tin access log thành công');
      onVerificationComplete?.('approved');
      onClose();
    } catch (error) {
      console.error('Error updating access log:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleInfo = () => (
    <Card 
      size="small" 
      className="verification-card"
      title={
        <Space>
          <CarOutlined />
          <span>Thông tin phương tiện</span>
        </Space>
      }
      extra={null}
    >
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Text strong>Biển số:</Text>
          <br />
          <Form.Item 
            name="licensePlate" 
            style={{ marginBottom: 8 }}
            tooltip="Nhập biển số để tự động tìm kiếm thông tin xe (tìm kiếm sau 1 giây)"
            rules={[{ required: true, message: 'Vui lòng nhập biển số' }]}
          >
            <Input.Search
              placeholder="Nhập biển số để tìm kiếm thông tin xe"
              loading={searchingVehicle}
              onSearch={handleLicensePlateSearch}
              onChange={(e) => {
                const value = e.target.value;
                setLicensePlateInput(value);
                form.setFieldValue('licensePlate', value);
              }}
              onPressEnter={(e) => handleLicensePlateSearch(e.target.value)}
              enterButton="Tìm kiếm"
              allowClear
              size="middle"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Hành động:</Text>
          <br />
          <Form.Item 
            name="action" 
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select placeholder="Chọn hành động">
              <Option value="entry">Vào</Option>
              <Option value="exit">Ra</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Màu xe:</Text>
          <br />
          <Form.Item name="vehicleColor" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập màu xe" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Mô tả:</Text>
          <br />
          <Form.Item name="vehicleDescription" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập mô tả xe" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Text strong>Độ tin cậy (%):</Text>
          <br />
          <Form.Item 
            name="confidence" 
            style={{ marginBottom: 8 }}
            rules={[
              { required: true, message: 'Vui lòng nhập độ tin cậy' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="Nhập độ tin cậy (0-100)" 
              min={0} 
              max={100}
              suffix="%" 
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderGuestInfo = () => (
    <Card 
      size="small"
      className="verification-card guest-info-card"
      title={
        <Space>
          <TeamOutlined />
          <span>Thông tin khách vãng lai</span>
          <span className="guest-mode-badge">KHÁCH VÃNG LAI</span>
        </Space>
      }
      extra={
        <Popconfirm
          title="Chuyển đổi chế độ"
          description="Bạn có chắc chắn muốn chuyển về chế độ chủ xe? Dữ liệu khách vãng lai đã nhập sẽ bị xóa."
          onConfirm={toggleGuestMode}
          okText="Có"
          cancelText="Không"
        >
          <Button 
            type="text" 
            icon={<SwapOutlined />}
            size="small"
            className="mode-toggle"
          >
            Chuyển về chủ xe
          </Button>
        </Popconfirm>
      }
    >
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Text strong>Tên khách:</Text>
          <br />
          <Form.Item 
            name="guestName" 
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: 'Vui lòng nhập tên khách' }]}
          >
            <Input placeholder="Nhập tên khách vãng lai" prefix={<UserOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Số điện thoại:</Text>
          <br />
          <Form.Item 
            name="guestPhone" 
            style={{ marginBottom: 8 }}
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" prefix={<PhoneOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Số CMND/CCCD:</Text>
          <br />
          <Form.Item 
            name="guestIdCard" 
            style={{ marginBottom: 8 }}
            rules={[
              { required: true, message: 'Vui lòng nhập số CMND/CCCD' },
              { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số CMND/CCCD" prefix={<IdcardOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Quê quán:</Text>
          <br />
          <Form.Item name="guestHometown" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập quê quán" prefix={<HomeOutlined />} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Text strong>Mục đích thăm viếng:</Text>
          <br />
          <Form.Item 
            name="guestVisitPurpose" 
            style={{ marginBottom: 8 }}
            rules={[{ required: true, message: 'Vui lòng nhập mục đích thăm viếng' }]}
          >
            <Input placeholder="Nhập mục đích thăm viếng" prefix={<FileTextOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Người liên hệ:</Text>
          <br />
          <Form.Item name="guestContactPerson" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập tên người liên hệ" prefix={<UserOutlined />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Ghi chú:</Text>
          <br />
          <Form.Item name="guestNotes" style={{ marginBottom: 8 }}>
            <Input placeholder="Ghi chú thêm" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderOwnerInfo = () => (
    <Card 
      size="small"
      className="verification-card"
      title={
        <Space>
          <UserOutlined />
          <span>Thông tin chủ xe</span>
        </Space>
      }
      extra={
        <Popconfirm
          title="Chuyển đổi chế độ"
          description="Bạn có chắc chắn muốn chuyển sang chế độ khách vãng lai? Dữ liệu chủ xe đã nhập sẽ bị xóa."
          onConfirm={toggleGuestMode}
          okText="Có"
          cancelText="Không"
        >
          <Button 
            type="text" 
            icon={<SwapOutlined />}
            size="small"
            className="mode-toggle"
          >
            Chuyển sang khách vãng lai
          </Button>
        </Popconfirm>
      }
    >
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Text strong>Tên:</Text>
          <br />
          <Form.Item name="ownerName" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập tên chủ xe" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Text strong>Tài khoản:</Text>
          <br />
          <Form.Item name="ownerUsername" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Text strong>Đơn vị:</Text>
          <br />
          <Form.Item name="departmentName" style={{ marginBottom: 8 }}>
            <Input placeholder="Nhập tên đơn vị" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderAccessDetails = () => (
    <Card 
      size="small"
      className="verification-card"
      title={
        <Space>
          <EnvironmentOutlined />
          <span>Chi tiết truy cập</span>
        </Space>
      }
    >
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Text strong>Cổng:</Text>
          <br />
          <Text>{accessLogData?.gateName || accessLogData?.gateId}</Text>
        </Col>
        <Col span={12}>
          <Text strong>Thời gian:</Text>
          <br />
          <Text>{new Date(accessLogData?.createdAt).toLocaleString('vi-VN')}</Text>
        </Col>
      </Row>
    </Card>
  );

  const renderMediaSection = () => {
    if (!accessLogData?.media) return null;
    
    return (
      <Card 
        size="small"
        className="verification-card"
        title={
          <Space>
            <CameraOutlined />
            <span>Hình ảnh & Video</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {accessLogData.media.originalImage && (
            <Col span={8}>
              <div className="media-item">
                <Text strong>Ảnh gốc</Text>
                <br />
                <Image
                  width={100}
                  src={accessLogData.media.originalImage}
                  placeholder="Đang tải..."
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FmuHkKJAIuxI2xIB2A2w2wI6Ag4CNcAMcBG6AHQFvgJ0BG2BH4AAcgQNwAA7AgXAEjsAB+P0/tU71dM+0pKlp9bT0Pq+BQu/prsJby3rOW6/qipRSSilN7Q/3E="
                />
              </div>
            </Col>
          )}
          
          {accessLogData.media.processedImage && (
            <Col span={8}>
              <div className="media-item">
                <Text strong>Ảnh đã xử lý</Text>
                <br />
                <Image
                  width={100}
                  src={accessLogData.media.processedImage}
                  placeholder="Đang tải..."
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FmuHkKJAIuxI2xIB2A2w2wI6Ag4CNcAMcBG6AHQFvgJ0BG2BH4AAcgQNwAA7AgXAEjsAB+P0/tU71dM+0pKlp9bT0Pq+BQu/prsJby3rOW6/qipRSSilN7Q/3E="
                />
              </div>
            </Col>
          )}
          
          {accessLogData.media.croppedPlateImage && (
            <Col span={8}>
              <div className="media-item">
                <Text strong>Biển số cắt</Text>
                <br />
                <Image
                  width={100}
                  src={accessLogData.media.croppedPlateImage}
                  placeholder="Đang tải..."
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FmuHkKJAIuxI2xIB2A2w2wI6Ag4CNcAMcBG6AHQFvgJ0BG2BH4AAcgQNwAA7AgXAEjsAB+P0/tU71dM+0pKlp9bT0Pq+BQu/prsJby3rOW6/qipRSSilN7Q/3E="
                />
              </div>
            </Col>
          )}
        </Row>
        
        {accessLogData.media.videoUrl && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text strong>Video ghi lại:</Text>
            <br />
            <video 
              width="300" 
              controls 
              className="verification-video"
              style={{ marginTop: 8 }}
              poster={accessLogData.media.videoThumbnail}
            >
              <source src={accessLogData.media.videoUrl} type="video/mp4" />
              Trình duyệt không hỗ trợ video.
            </video>
          </div>
        )}
      </Card>
    );
  };

  const renderVerificationStatus = () => {
    const status = accessLogData?.verificationStatus || 'pending';
    const statusConfig = {
      pending: { color: 'warning', text: 'Chờ xác minh' },
      approved: { color: 'success', text: 'Đã phê duyệt' },
      rejected: { color: 'error', text: 'Đã từ chối' },
      processing: { color: 'processing', text: 'Đang xử lý' }
    };

    return (
      <Card 
        size="small"
        className="verification-card"
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>Trạng thái xác minh</span>
          </Space>
        }
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Trạng thái hiện tại:</Text>
            <br />
            <Badge 
              status={statusConfig[status]?.color || 'warning'} 
              text={statusConfig[status]?.text || 'Không xác định'} 
            />
          </Col>
          <Col span={12}>
            <Text strong>Xe đã đăng ký:</Text>
            <br />
            <Badge 
              status={accessLogData?.isVehicleRegistered ? 'success' : 'error'}
              text={accessLogData?.isVehicleRegistered ? 'Có' : 'Không'}
            />
          </Col>
          <Col span={24}>
            <Text strong>Quá trình xác minh:</Text>
            <br />
            <Progress
              percent={editMode ? 50 : 25}
              steps={4}
              strokeColor="#1890ff"
              size="small"
              format={() => editMode ? '2/4' : '1/4'}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              {editMode ? 'Đang chỉnh sửa thông tin' : 'Đang chờ xác minh'}
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderProcessingInfo = () => {
    if (!accessLogData?.media?.imageMetadata) return null;

    const metadata = accessLogData.media.imageMetadata;
    return (
      <Card 
        size="small"
        className="verification-card"
        title={
          <Space>
            <HistoryOutlined />
            <span>Thông tin xử lý</span>
          </Space>
        }
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Camera ID:</Text>
            <br />
            <Text code>{metadata.cameraId || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Thời gian xử lý:</Text>
            <br />
            <Text>{metadata.processingTime || 0}ms</Text>
          </Col>
          <Col span={12}>
            <Text strong>Chất lượng ảnh:</Text>
            <br />
            <Tag color={metadata.imageQuality === 'high' ? 'green' : metadata.imageQuality === 'medium' ? 'orange' : 'red'}>
              {metadata.imageQuality === 'high' ? 'Cao' : 
               metadata.imageQuality === 'medium' ? 'Trung bình' : 
               metadata.imageQuality === 'low' ? 'Thấp' : 'Không xác định'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>Độ phân giải:</Text>
            <br />
            <Text>{metadata.resolution || 'Không xác định'}</Text>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <Avatar 
            icon={<CarOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Cập nhật Access Log
              {isGuestMode && (
                <Badge 
                  count="Khách vãng lai" 
                  style={{ 
                    backgroundColor: '#fa8c16',
                    marginLeft: 8,
                    fontSize: '10px',
                    height: '20px',
                    lineHeight: '18px',
                    borderRadius: '10px'
                  }}
                />
              )}
            </Title>
            <Text type="secondary">
              ID: {accessLogData?.accessLogId}
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
      maskClosable={false}
      className="access-verification-modal"
    >
      <Form form={form} layout="vertical" className="verification-form"      >
        <Alert
          message="Cập nhật thông tin Access Log"
          description={`Vui lòng kiểm tra và cập nhật thông tin cho xe ${accessLogData?.licensePlate} ${accessLogData?.action === 'entry' ? 'vào' : 'ra'} tại ${accessLogData?.gateName || accessLogData?.gateId}.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {vehicleFound && (
          <Alert
            message="Thông tin xe đã được tự động điền"
            description={
              <Space direction="vertical" size="small">
                <span>Hệ thống đã tìm thấy và tự động điền thông tin xe, chủ xe từ cơ sở dữ liệu. Vui lòng kiểm tra và xác nhận thông tin trước khi cập nhật.</span>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={clearVehicleInfo}
                  style={{ padding: 0, height: 'auto' }}
                >
                  Xóa thông tin tự động điền
                </Button>
              </Space>
            }
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setVehicleFound(false)}
          />
        )}

        {searchingVehicle && (
          <Alert
            message="Đang tìm kiếm thông tin xe..."
            description="Hệ thống đang tìm kiếm thông tin xe trong cơ sở dữ liệu. Vui lòng chờ trong giây lát."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {isGuestMode && (
          <Alert
            message="Chế độ khách vãng lai"
            description={
              <Space direction="vertical" size="small">
                <span>Đang ở chế độ khách vãng lai. Vui lòng điền đầy đủ thông tin khách để cập nhật access log.</span>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={toggleGuestMode}
                  style={{ padding: 0, height: 'auto' }}
                >
                  Chuyển về chế độ chủ xe thông thường
                </Button>
              </Space>
            }
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setIsGuestMode(false)}
          />
        )}

        <Row gutter={[16, 16]}>
          <Col span={24}>
            {renderVehicleInfo()}
          </Col>
          
          <Col span={24}>
            {isGuestMode ? renderGuestInfo() : renderOwnerInfo()}
          </Col>
          
          <Col span={24}>
            {renderAccessDetails()}
          </Col>
          
          <Col span={24}>
            {renderVerificationStatus()}
          </Col>
          
          <Col span={24}>
            {renderProcessingInfo()}
          </Col>
          
          <Col span={24}>
            {renderMediaSection()}
          </Col>

          <Col span={24}>
            {renderProcessingInfo()}
          </Col>
          
          <Col span={24}>
            <Card 
              size="small"
              className="verification-card"
              title={
                <Space>
                  <EditOutlined />
                  <span>Ghi chú cập nhật</span>
                </Space>
              }
            >
              <Form.Item 
                name="verificationNotes"
                label="Ghi chú cập nhật"
              >
                <TextArea 
                  rows={3}
                  placeholder="Nhập ghi chú về việc cập nhật thông tin access log (không bắt buộc)..."
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        <div className="verification-actions">
          <Button onClick={onClose}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={handleUpdate}
            loading={loading}
          >
            Cập nhật
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AccessLogVerificationModal;
