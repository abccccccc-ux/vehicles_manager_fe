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
import vehicleApi from "../../api/vehicleApi";
import { createWorkingHoursRequest } from "../../store/workingHoursRequestSlice";

const { Option } = Select;

const CreatePersonalWorkingHoursRequest = ({
  visible,
  onCancel,
  onCreated,
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
    if (!visible) return;
    // fetch my vehicles
    const fetch = async () => {
      setLoadingVehicles(true);
      try {
        const res = await vehicleApi.getMyVehicles({ limit: 100 });
        if (res && res.success) {
          // res.data may be array or object with items
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
    fetch();
  }, [visible]);

  const onFinish = async (values) => {
    // values: requestType, licensePlate, plannedDateTime (dayjs), plannedEndDateTime (dayjs), reason
    const body = {
      requestType: values.requestType,
      plannedDateTime: values.plannedDateTime.toISOString(),
      licensePlate: values.licensePlate,
    };

    // only include 'plannedEndDateTime' when provided
    if (values.plannedEndDateTime) {
      body.plannedEndDateTime = values.plannedEndDateTime.toISOString();
    }

    // only include 'reason' when it's not empty (avoid sending empty string)
    if (values.reason && values.reason.trim() !== "") {
      body.reason = values.reason.trim();
    }

    try {
      const result = await dispatch(createWorkingHoursRequest(body)).unwrap();
      if (result && result.success) {
        message.success(result.message || "Tạo yêu cầu thành công");
        form.resetFields();
        setRequestType(null);
        onCreated && onCreated(result.data?.request);
      } else {
        message.error(
          result?.errors[0].message || "Tạo yêu cầu không thành công"
        );
      }
    } catch (err) {
      message.error(err || "Lỗi khi tạo yêu cầu");
    }
  };

  return (
    <Modal
      title="Tạo yêu cầu ra/vào"
      visible={visible}
      onCancel={() => {
        form.resetFields();
        setRequestType(null);
        onCancel && onCancel();
      }}
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
            Gửi yêu cầu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePersonalWorkingHoursRequest;
