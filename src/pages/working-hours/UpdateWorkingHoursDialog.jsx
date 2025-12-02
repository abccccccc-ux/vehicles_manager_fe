import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, notification, Checkbox, InputNumber, TimePicker, Switch } from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { updateWorkingHours } from '../../store/workingHoursSlice';

const dayOptions = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

const UpdateWorkingHoursDialog = ({ visible, onClose, onSuccess, workingHour }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const updating = useSelector((state) => state.workingHours?.updating);

  useEffect(() => {
    if (visible && workingHour) {
      form.setFieldsValue({
        name: workingHour.name,
        startTime: workingHour.startTime ? dayjs(workingHour.startTime, 'HH:mm') : undefined,
        endTime: workingHour.endTime ? dayjs(workingHour.endTime, 'HH:mm') : undefined,
        workingDays: workingHour.workingDays || [],
        lateToleranceMinutes: workingHour.lateToleranceMinutes ?? 0,
        earlyToleranceMinutes: workingHour.earlyToleranceMinutes ?? 0,
        description: workingHour.description || '',
        isActive: workingHour.isActive ?? true,
      });
    }
    if (!visible) {
      form.resetFields();
    }
  }, [visible, workingHour]);

  const cleanPayload = (obj) => {
    const out = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (Array.isArray(v) && v.length === 0) return;
      out[k] = v;
    });
    return out;
  };

  const handleSubmit = async (values) => {
    try {
      const raw = {
        name: values.name,
        startTime: values.startTime ? dayjs(values.startTime).format('HH:mm') : undefined,
        endTime: values.endTime ? dayjs(values.endTime).format('HH:mm') : undefined,
        workingDays: values.workingDays || [],
        lateToleranceMinutes: values.lateToleranceMinutes || 0,
        earlyToleranceMinutes: values.earlyToleranceMinutes || 0,
        description: values.description || '',
        isActive: values.isActive,
      };

      const payload = cleanPayload(raw);

      const action = await dispatch(updateWorkingHours({ id: workingHour._id || workingHour.key, payload }));
      const result = unwrapResult(action);

      if (result && result.success) {
        notification.success({ message: 'Thành công', description: result.message || 'Cập nhật cài đặt giờ làm việc thành công', placement: 'bottomRight' });
        if (onSuccess) onSuccess();
      } else {
        const msg = result?.message || 'Cập nhật thất bại';
        notification.error({ message: 'Lỗi', description: msg, placement: 'bottomRight' });
      }
    } catch (err) {
      console.error('UpdateWorkingHours exception:', err);
      notification.error({ message: 'Lỗi', description: err?.message || 'Cập nhật thất bại', placement: 'bottomRight' });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Cập nhật ca làm việc"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item name="name" label="Tên ca" rules={[{ required: true, message: 'Vui lòng nhập tên ca' }]}>
          <Input placeholder="Ví dụ: Giờ sáng" />
        </Form.Item>

        <Form.Item name="startTime" label="Bắt đầu" rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}>
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="endTime" label="Kết thúc" rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}>
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="workingDays" label="Ngày làm việc" rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 ngày' }]}>
          <Checkbox.Group options={dayOptions} />
        </Form.Item>

        <Form.Item name="lateToleranceMinutes" label="Dung sai trễ (phút)" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="earlyToleranceMinutes" label="Dung sai sớm (phút)" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="description" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Mô tả (tuỳ chọn)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={updating} block>
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateWorkingHoursDialog;
