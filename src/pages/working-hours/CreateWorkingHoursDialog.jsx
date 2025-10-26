import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, notification, Checkbox, InputNumber, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { createWorkingHours } from '../../store/workingHoursSlice';

const dayOptions = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

const CreateWorkingHoursDialog = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const creating = useSelector((state) => state.workingHours?.creating);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
  }, [visible]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        startTime: values.startTime ? dayjs(values.startTime).format('HH:mm') : undefined,
        endTime: values.endTime ? dayjs(values.endTime).format('HH:mm') : undefined,
        workingDays: values.workingDays || [],
        lateToleranceMinutes: values.lateToleranceMinutes || 0,
        earlyToleranceMinutes: values.earlyToleranceMinutes || 0,
        description: values.description || '',
      };

      const action = await dispatch(createWorkingHours(payload));
      const result = unwrapResult(action);

      if (result && result.success) {
        notification.success({ message: 'Thành công', description: result.message || 'Tạo cài đặt giờ làm việc thành công', placement: 'bottomRight' });
        form.resetFields();
        if (onSuccess) onSuccess();
      } else {
        const msg = result?.message || 'Tạo thất bại';
        console.error('CreateWorkingHours failed:', msg);
      }
    } catch (err) {
      console.error('CreateWorkingHours exception:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Thêm mới ca làm việc"
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

        <Form.Item name="description" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Mô tả (tuỳ chọn)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={creating} block>
            {creating ? 'Đang tạo...' : 'Tạo mới'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWorkingHoursDialog;
