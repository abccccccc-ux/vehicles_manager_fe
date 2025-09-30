import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import userApi from '../../api/userApi';
import AlertMessage from '../../components/AlertMessage';

const { Option } = Select;

const CreateUserDialog = ({ visible, onClose, onSuccess }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);

	const handleSubmit = async (values) => {
		try {
			setLoading(true);
			setAlert(null);
			const res = await userApi.createUser(values);
			if (res.data.success) {
				setAlert({ type: 'success', message: res.data.message });
				form.resetFields();
				if (onSuccess) onSuccess();
			} else {
				setAlert({ type: 'error', message: res.data.message || 'Tạo user thất bại' });
			}
		} catch (error) {
			setAlert({ type: 'error', message: error?.response?.data?.errors[0].message || 'Có lỗi xảy ra' });
		}
		setLoading(false);
	};

	const handleCancel = () => {
		setAlert(null);
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
			{alert && <AlertMessage type={alert.type} message={alert.message} />}
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item
					name="username"
					label="Username"
					rules={[{ required: true, message: 'Vui lòng nhập username' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name="name"
					label="Họ tên"
					rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name="password"
					label="Mật khẩu"
					rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item
					name="role"
					label="Vai trò"
					rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
				>
					<Select>
						<Option value="user">User</Option>
						<Option value="admin">Admin</Option>
						<Option value="super_admin">Super Admin</Option>
					</Select>
				</Form.Item>

				<Form.Item
					name="phone"
					label="SĐT"
					rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={loading} block>
						Thêm mới
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default CreateUserDialog;
