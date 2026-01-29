import { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, Input, Button, Spin, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import vehicleApi from '../../api/vehicleApi';
import { createWorkingHoursRequest } from '../../store/workingHoursRequestSlice';
import { formatLicensePlate } from '../../utils/licensePlate';

const { Option } = Select;

const CreatePersonalWorkingHoursRequest = ({ visible, onCancel, onCreated }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const createLoading = useSelector((s) => s.workingHoursRequests.createLoading);

  useEffect(() => {
    if (!visible) return;
    // fetch my vehicles
    const fetch = async () => {
      setLoadingVehicles(true);
      try {
        const res = await vehicleApi.getVehicles({ limit: 100 });
        if (res && res.success) {
          // res.data may be array or object with items
          const items = Array.isArray(res.data) ? res.data : (res.data?.vehicles || res.data?.items || []);
          setVehicles(items || []);
        } else {
          message.error(res?.message || 'Không thể lấy danh sách xe');
        }
      } catch (err) {
        message.error(err.message || 'Lỗi khi lấy xe');
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetch();
  }, [visible]);

  const onFinish = async (values) => {
    console.log("🚀 ~ onFinish ~ values:", values)
    
    // Tìm xe được chọn để lấy owner._id
    const selectedVehicle = vehicles.find(v => v.licensePlate === values.licensePlate);
    
    // values: requestType, licensePlate, plannedEntryTime (dayjs), plannedExitTime (dayjs), reason
    const body = {
      requestType: values.requestType,
      licensePlate: values.licensePlate,
    };

    // Thêm requestedBy nếu có thông tin owner
    if (selectedVehicle?.owner?._id) {
      body.requestedBy = selectedVehicle.owner._id;
    }

    if (values.plannedExitTime) {
      body.plannedExitTime = values.plannedExitTime.toISOString();
    }

    if (values.plannedEntryTime) {
      body.plannedEntryTime = values.plannedEntryTime.toISOString();
    }

    // only include 'reason' when it's not empty (avoid sending empty string)
    if (values.reason && values.reason.trim() !== '') {
      body.reason = values.reason.trim();
    }

    try {
      const result = await dispatch(createWorkingHoursRequest(body)).unwrap();
      if (result && result.success) {
        message.success(result.message || 'Tạo yêu cầu thành công');
        form.resetFields();
        onCreated && onCreated(result.data?.request);
      } else {
        // Xử lý trường hợp result không success
        const errorMsg = result?.message || result?.errors?.[0]?.message || 'Tạo yêu cầu không thành công';
        message.error(errorMsg);
      }
    } catch (err) {
      // err đã được xử lý thành string từ slice
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Lỗi khi tạo yêu cầu';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      title="Tạo yêu cầu ra/vào"
      visible={visible}
      onCancel={() => {
        form.resetFields();
        onCancel && onCancel();
      }}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="requestType" label="Loại yêu cầu" rules={[{ required: true, message: 'Chọn loại yêu cầu' }]}>
          <Select placeholder="Chọn loại">
            <Option value="exit">Ra</Option>
            <Option value="entry">Vào</Option>
            <Option value="both">Cả hai</Option>
          </Select>
        </Form.Item>

        <Form.Item name="licensePlate" label="Biển số" rules={[{ required: true, message: 'Chọn biển số' }]}>
          {loadingVehicles ? (
            <Spin />
          ) : (
            <Select showSearch placeholder="Chọn biển số" optionFilterProp="children">
              {vehicles.map((v) => (
                <Option key={v._id || v.licensePlate} value={v.licensePlate}>
                  {formatLicensePlate(v.licensePlate)}{v.name ? ` - ${v.name}` : ''}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        {/* Thời gian Ra (Exit): hiển thị khi Ra (exit) hoặc Cả hai (both) */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.requestType !== curr.requestType}>
          {({ getFieldValue }) => {
            const requestType = getFieldValue('requestType');
            const showExitTime = requestType === 'exit' || requestType === 'both';
            return showExitTime ? (
              <Form.Item
                name="plannedExitTime"
                label="Thời gian ra (dự kiến)"
                rules={[{ required: true, message: 'Chọn thời gian ra' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        {/* Thời gian Vào (Entry): hiển thị khi Vào (entry) hoặc Cả hai (both) */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.requestType !== curr.requestType}>
          {({ getFieldValue }) => {
            const requestType = getFieldValue('requestType');
            const showEntryTime = requestType === 'entry' || requestType === 'both';
            return showEntryTime ? (
              <Form.Item
                name="plannedEntryTime"
                label="Thời gian vào (dự kiến)"
                rules={[{ required: true, message: 'Chọn thời gian vào' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Nhập lý do' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={createLoading} block>
            Gửi yêu cầu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePersonalWorkingHoursRequest;
