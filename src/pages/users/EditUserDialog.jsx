import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Spin, notification, Switch } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import departmentApi from '../../api/departmentApi';
import userApi from '../../api/userApi';
import { editUser, fetchUserById, clearUserDetails } from '../../store/userSlice';

const { Option } = Select;

const EditUserDialog = ({ visible, onClose, userId, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { userDetails, userDetailsLoading } = useSelector((state) => state.users || {});

  const [departments, setDepartments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load departments when modal opens
  useEffect(() => {
    if (!visible) return;

    const loadDeps = async () => {
      setLoadingDeps(true);
      try {
        const res = await departmentApi.getDepartments();
        if (res?.data?.success && Array.isArray(res.data.data)) {
          setDepartments(res.data.data.map((d) => ({ ...d, id: d.id ?? d._id })));
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error('Load departments failed', err);
        setDepartments([]);
      } finally {
        setLoadingDeps(false);
      }
    };

    loadDeps();
  }, [visible]);

  // Load user details when modal opens or userId changes
  useEffect(() => {
    if (!visible || !userId) return;

    const loadUser = async () => {
      try {
        // use API directly to get shape as expected
        const res = await userApi.getUserById(userId);
        if (res?.data?.success && res.data.data?.user) {
          const u = res.data.data.user;
          // prefill form - handle department id or object
          form.setFieldsValue({
            username: u.username,
            name: u.name,
            role: u.role,
            phone: u.phone,
            department: u.department?._id || u.department,
            employeeId: u.employeeId,
            isActive: typeof u.isActive === 'boolean' ? u.isActive : true,
          });
        }
      } catch (err) {
        console.error('Load user failed', err);
      }
    };

    loadUser();
    // populate redux userDetails as well
    dispatch(fetchUserById(userId));

    return () => {
      dispatch(clearUserDetails());
      form.resetFields();
    };
  }, [visible, userId]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
// prepare payload
const payloadData = {
  name: values.name,
  role: values.role,
  phone: values.phone,
  employeeId: values.employeeId,
  department: values.department,
  isActive: !!values.isActive,
};

      const actionRes = await dispatch(editUser({ userId, data: payloadData }));
      if (editUser.fulfilled.match(actionRes)) {
        const successMsg = actionRes.payload?.data?.message || 'Cập nhật thành công';
        notification.success({ message: 'Thành công', description: successMsg, placement: 'bottomRight' });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const err = actionRes.payload || actionRes.error;
        const message = err?.message || err?.data?.message || 'Cập nhật thất bại';
        // show single notification at bottom-right
        notification.error({ message: 'Lỗi', description: message, placement: 'bottomRight' });
      }
    } catch (err) {
      console.error(err);
      const message = err?.message || 'Có lỗi xảy ra';
      notification.error({ message: 'Lỗi', description: message, placement: 'bottomRight' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa người dùng"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      {/* Notifications use antd's notification with placement bottomRight; inline alert removed */}

      <Spin spinning={userDetailsLoading || loadingDeps}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{}}
        >
          <Form.Item label="Tên đăng nhập" name="username">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="super_admin">Super Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Mã nhân viên"
            name="employeeId"
            rules={[
              { required: true, message: 'Vui lòng nhập mã nhân viên' },
            ]}
          >
            <Input placeholder="Mã nhân viên" />
          </Form.Item>

          <Form.Item
            label="Phòng ban"
            name="department"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select
              loading={loadingDeps}
              placeholder="Chọn phòng ban"
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {departments.map((d) => (
                <Option key={d.id ?? d._id} value={d.id ?? d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EditUserDialog;
