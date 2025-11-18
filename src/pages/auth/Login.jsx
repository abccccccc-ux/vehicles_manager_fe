import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { login as loginApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
// logo removed (not used) to avoid unused import warning

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);
    try {
      const res = await loginApi(username, password);
      if (res && res.success) {
        if (res.data?.tokens) {
          localStorage.setItem('accessToken', res.data.tokens.accessToken);
          localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
        }
        if (res.data?.user) {
          // Persist full user object so we can restore auth state after a page reload
          localStorage.setItem('user', JSON.stringify(res.data.user));
          // keep older keys for backward compatibility
          localStorage.setItem('userId', res.data.user._id || res.data.user.id || '');
          localStorage.setItem('role', res.data.user.role || '');
        }

        dispatch(loginSuccess(res.data));
        message.success('Đăng nhập thành công');
        navigate('/dashboard');
      } else {
        message.error(res?.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      message.error('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = ({ errorFields }) => {
    if (errorFields?.length) {
      message.error(errorFields[0]?.errors[0] || 'Vui lòng kiểm tra thông tin');
    }
  };

  return (
    <div className="login-wrapper">
      <Card className="login-card" bordered={false}>
        <div className="text-center mb-6 flex flex-col items-center">
          <Title level={3} style={{ margin: 0 }}>
            Quản lý phương tiện
          </Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          <Form.Item
            label="Email hoặc Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập email hoặc username' }]}
          >
            <Input size="large" placeholder="Email hoặc Username" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              size="large"
              placeholder="Mật khẩu"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
