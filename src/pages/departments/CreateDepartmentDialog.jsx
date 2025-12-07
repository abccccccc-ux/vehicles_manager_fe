import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Spin, message, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createDepartment, fetchDepartments } from '../../store/departmentSlice';
import userApi from '../../api/userApi';

const CreateDepartmentDialog = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.departments);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Load managers list when dialog opens
  useEffect(() => {
    if (visible) {
      loadManagers();
    }
  }, [visible]);

  const loadManagers = async () => {
    try {
      setLoadingManagers(true);
      const { data } = await userApi.getUsers({ isActive: true, limit: 1000, role: 'admin' });
      setManagers(data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách trưởng đơn vị');
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const departmentData = {
        name: values.name,
        code: values.code,
        description: values.description || '',
        manager: values.manager || null,
        isActive: values.isActive ?? true,
      };

      const result = await dispatch(createDepartment(departmentData));

      if (result.payload) {
        message.success('Tạo Đơn vị thành công');
        form.resetFields();
        onClose();
        // Refresh the list
        dispatch(fetchDepartments({ page: 1, limit: 10 }));
      } else if (result.payload === undefined && !result.type.endsWith('/fulfilled')) {
        message.error(result.error?.message || 'Tạo Đơn vị thất bại');
      }
    } catch (error) {
      message.error(error.message || 'Tạo Đơn vị thất bại');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Tạo Đơn vị"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText="Tạo mới"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Tên Đơn vị"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên Đơn vị' },
            { min: 2, message: 'Tên Đơn vị phải ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Ví dụ: Hệ học viên 5" />
        </Form.Item>

        <Form.Item
          label="Mã Đơn vị"
          name="code"
          rules={[
            { required: true, message: 'Vui lòng nhập mã Đơn vị' },
            { min: 1, max: 20, message: 'Mã Đơn vị từ 1 đến 20 ký tự' },
          ]}
        >
          <Input placeholder="Ví dụ: H5" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <Input.TextArea
            placeholder="Nhập mô tả Đơn vị"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label="Trưởng Đơn vị"
          name="manager"
        >
          <Select
            placeholder="Chọn trưởng Đơn vị (không bắt buộc)"
            allowClear
            loading={loadingManagers}
            notFoundContent={
              loadingManagers ? (
                <Spin size="small" />
              ) : managers.length === 0 ? (
                <Empty description="Không có người dùng" />
              ) : null
            }
            options={managers.map((user) => ({
              label: `${user.name} (${user.username})`,
              value: user._id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDepartmentDialog;
