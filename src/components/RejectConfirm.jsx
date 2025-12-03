import React from 'react';
import { Modal, Form, Input } from 'antd';

const { TextArea } = Input;

const RejectConfirm = ({ visible, onCancel, onConfirm, confirmLoading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const note = values.approvalNote ? values.approvalNote.trim() : undefined;
      onConfirm(note);
      form.resetFields();
    } catch (e) {
      // validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Xác nhận từ chối"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Từ chối"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="approvalNote" label="Lý do từ chối (tùy chọn)" rules={[{ max: 300, message: 'Lý do không được vượt quá 300 ký tự' }] }>
          <TextArea rows={4} maxLength={300} placeholder="Nhập lý do từ chối (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RejectConfirm;
