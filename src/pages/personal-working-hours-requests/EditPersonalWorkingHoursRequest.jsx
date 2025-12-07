import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Spin,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import vehicleApi from "../../api/vehicleApi";
import { updateWorkingHoursRequest } from "../../store/workingHoursRequestSlice";

const { Option } = Select;

const EditPersonalWorkingHoursRequest = ({
  visible,
  onCancel,
  onUpdated,
  request, // yêu cầu cần chỉnh sửa
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [requestType, setRequestType] = useState(null);

  const createLoading = useSelector(
    (s) => s.workingHoursRequests.createLoading
  );

  useEffect(() => {
    if (!visible || !request) return;
    
    // fetch my vehicles
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const res = await vehicleApi.getMyVehicles({ limit: 100 });
        if (res && res.success) {
          const items = Array.isArray(res.data)
            ? res.data
            : res.data?.vehicles || res.data?.items || [];
          setVehicles(items || []);
        } else {
          message.error(res?.message || "Không thể lấy danh sách xe");
        }
      } catch (err) {
        message.error(err.message || "Lỗi khi lấy xe");
      } finally {
        setLoadingVehicles(false);
      }
    };
    
    fetchVehicles();
    
    // Set form values từ request hiện tại
    setRequestType(request.requestType);
    form.setFieldsValue({
      requestType: request.requestType,
      licensePlate: request.licensePlate,
      plannedDateTime: request.plannedDateTime ? dayjs(request.plannedDateTime) : null,
      plannedEndDateTime: request.plannedEndDateTime ? dayjs(request.plannedEndDateTime) : null,
      reason: request.reason || "",
    });
  }, [visible, request, form]);

  const onFinish = async (values) => {
    if (!request?._id) {
      message.error("Không tìm thấy ID yêu cầu");
      return;
    }

    const body = {
      requestType: values.requestType,
      plannedDateTime: values.plannedDateTime.toISOString(),
      licensePlate: values.licensePlate,
    };

    // only include 'plannedEndDateTime' when provided
    if (values.plannedEndDateTime) {
      body.plannedEndDateTime = values.plannedEndDateTime.toISOString();
    }

    // only include 'reason' when it's not empty
    if (values.reason && values.reason.trim() !== "") {
      body.reason = values.reason.trim();
    }

    try {
      const result = await dispatch(updateWorkingHoursRequest({ 
        id: request._id, 
        body 
      })).unwrap();
      
      if (result && result.success) {
        message.success(result.message || "Cập nhật yêu cầu thành công");
        form.resetFields();
        setRequestType(null);
        onUpdated && onUpdated(result.data?.request);
      } else {
        message.error(
          result?.errors?.[0]?.message || "Cập nhật yêu cầu không thành công"
        );
      }
    } catch (err) {
      message.error(err || "Lỗi khi cập nhật yêu cầu");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setRequestType(null);
    onCancel && onCancel();
  };

  return (
    <Modal
      title="Chỉnh sửa yêu cầu ra/vào"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="requestType"
          label="Loại yêu cầu"
          rules={[{ required: true, message: "Chọn loại yêu cầu" }]}
        >
          <Select
            placeholder="Chọn loại"
            onChange={(value) => setRequestType(value)}
          >
            <Option value="exit">Ra</Option>
            <Option value="entry">Vào</Option>
            <Option value="both">Cả hai</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="licensePlate"
          label="Biển số"
          rules={[{ required: true, message: "Chọn biển số" }]}
        >
          {loadingVehicles ? (
            <Spin />
          ) : (
            <Select
              showSearch
              placeholder="Chọn biển số"
              optionFilterProp="children"
            >
              {vehicles.map((v) => (
                <Option key={v._id || v.licensePlate} value={v.licensePlate}>
                  {v.licensePlate}
                  {v.name ? ` - ${v.name}` : ""}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          name="plannedDateTime"
          label="Thời gian bắt đầu"
          rules={[{ required: true, message: "Chọn thời gian bắt đầu" }]}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>

        {requestType === "both" && (
          <Form.Item
            name="plannedEndDateTime"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: "Chọn thời gian kết thúc" }]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        )}

        <Form.Item name="reason" label="Lý do">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLoading}
            block
          >
            Cập nhật yêu cầu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPersonalWorkingHoursRequest;
