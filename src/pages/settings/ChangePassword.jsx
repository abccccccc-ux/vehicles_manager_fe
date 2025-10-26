import React, { useState } from 'react';
import { Form, Input, Button, Spin, notification } from 'antd';
// inline AlertMessage replaced by antd notification (bottomRight)
import { changePassword } from '../../api/authApi';
import MainLayout from '../../layouts/MainLayout';

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
    setLoading(true);
        try {
            const response = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            if (response.success) {
                            notification.success({ message: 'Thành công', description: response.message, placement: 'bottomRight' });
                form.resetFields();
            } else {
                            notification.error({ message: 'Lỗi', description: response.message || 'Đổi mật khẩu thất bại', placement: 'bottomRight' });
            }
        } catch (error) {
                notification.error({ message: 'Lỗi', description: error?.response?.data?.message || 'Có lỗi xảy ra', placement: 'bottomRight' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div style={{ maxWidth: 500, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 8 }}>
                <h2 style={{ textAlign: 'center' }}>Đổi mật khẩu</h2>
                {/* Notifications use antd notification (bottomRight) */}
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