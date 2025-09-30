import React, { useState } from 'react';
import { Form, Input, Button, Spin } from 'antd';
import AlertMessage from '../../components/AlertMessage';
import { changePassword } from '../../api/authApi';
import MainLayout from '../../layouts/MainLayout';

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });

    const onFinish = async (values) => {
        setLoading(true);
        setAlert({ type: '', message: '' });
        try {
            const response = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            if (response.success) {
                setAlert({ type: 'success', message: response.message });
                form.resetFields();
            } else {
                setAlert({ type: 'error', message: response.message || 'Đổi mật khẩu thất bại' });
            }
        } catch (error) {
            setAlert({ type: 'error', message: error?.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div style={{ maxWidth: 500, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
                <h2 style={{ textAlign: 'center' }}>Đổi mật khẩu</h2>
                {alert.message && <AlertMessage type={alert.type} message={alert.message} />}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Mật khẩu nhập lại không khớp!');
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block disabled={loading}>
                            {loading ? <Spin /> : 'Đổi mật khẩu'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </MainLayout>
    );
};

export default ChangePassword;