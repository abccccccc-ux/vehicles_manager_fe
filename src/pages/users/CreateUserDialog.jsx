import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, notification } from 'antd';
import userApi from '../../api/userApi';
import departmentApi from '../../api/departmentApi';
// inline AlertMessage replaced by antd notification (bottomRight)

const { Option } = Select;

const CreateUserDialog = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // 🔹 Load danh sách phòng ban khi mở modal
  useEffect(() => {
    if (!visible) return;

    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const res = await departmentApi.getDepartments();
        if (res?.data?.success && Array.isArray(res.data.data)) {
          // Chuẩn hoá: đảm bảo mỗi phòng có trường `id` (dùng dep.id làm value)
          setDepartments(
            res.data.data.map((d) => ({ ...d, id: d.id ?? d._id }))
          );
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error('Fetch departments failed:', error);
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, [visible]);

  // 🔹 Submit form
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // using notification instead of inline alert

      console.log('form values:', values); // debug: kiểm tra values.department

      const payload = {
        ...values,
        department: values.department, 
      };

      const res = await userApi.createUser(payload);

      if (res?.data?.success) {
        notification.success({ message: 'Thành công', description: res.data.message || 'Tạo người dùng thành công', placement: 'bottomRight' });
        form.resetFields();
        if (onSuccess) onSuccess();
      } else {
        notification.error({ message: 'Lỗi', description: res?.data?.message || 'Tạo người dùng thất bại', placement: 'bottomRight' });
      }
    } catch (error) {
      const msg =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        'Có lỗi xảy ra khi tạo người dùng';
      notification.error({ message: 'Lỗi', description: msg, placement: 'bottomRight' });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Đóng modal
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Thêm mới người dùng"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
  {/* Notifications use antd notification (bottomRight) */}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        >
          <Input placeholder="Nhập tên đăng nhập" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input placeholder="Nhập họ tên đầy đủ" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        >
          <Select placeholder="Chọn vai trò" allowClear>
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
            <Option value="super_admin">Super Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            {
              pattern: /^[0-9]{9,11}$/,
              message: 'Số điện thoại không hợp lệ',
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="department"
          label="Phòng ban"
          rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
        >
          <Select
            loading={departmentsLoading}
            placeholder="Chọn phòng ban"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {departments.map((dep) => (
              <Option key={dep.id ?? dep._id} value={dep.id ?? dep._id}>
                {dep.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            disabled={loading}
          >
            {loading ? 'Đang thêm...' : 'Thêm mới'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUserDialog;
