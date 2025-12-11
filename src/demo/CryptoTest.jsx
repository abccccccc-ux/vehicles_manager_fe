import React, { useState } from 'react';
import { Card, Input, Button, Row, Col, Space, notification } from 'antd';
import { encryptPassword, decryptPassword, isEncrypted, safeDisplayPassword } from '../utils/cryptoUtils';

const CryptoTest = () => {
  const [plainText, setPlainText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    if (!plainText.trim()) {
      notification.warning({ message: 'Vui lòng nhập mật khẩu để mã hóa' });
      return;
    }

    setLoading(true);
    try {
      const encrypted = await encryptPassword(plainText);
      setEncryptedText(encrypted);
      notification.success({ message: 'Mã hóa thành công!' });
    } catch (error) {
      console.error('Encryption error:', error);
      notification.error({ message: 'Lỗi mã hóa: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedText.trim()) {
      notification.warning({ message: 'Vui lòng nhập mật khẩu đã mã hóa để giải mã' });
      return;
    }

    setLoading(true);
    try {
      const decrypted = await decryptPassword(encryptedText);
      setDecryptedText(decrypted);
      notification.success({ message: 'Giải mã thành công!' });
    } catch (error) {
      console.error('Decryption error:', error);
      notification.error({ message: 'Lỗi giải mã: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDecrypt = async () => {
    if (!encryptedText.trim()) {
      notification.warning({ message: 'Vui lòng nhập mật khẩu để auto giải mã' });
      return;
    }

    setLoading(true);
    try {
      const result = await safeDisplayPassword(encryptedText);
      setDecryptedText(result);
      notification.success({ message: 'Auto giải mã thành công!' });
    } catch (error) {
      console.error('Auto decrypt error:', error);
      notification.error({ message: 'Lỗi auto giải mã: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkEncryptionStatus = () => {
    const encrypted = isEncrypted(encryptedText);
    notification.info({ 
      message: encrypted ? 'Đây là mật khẩu đã mã hóa' : 'Đây KHÔNG phải mật khẩu đã mã hóa',
      description: `Format: ${encrypted ? 'Hợp lệ (IV:EncryptedData)' : 'Không hợp lệ'}`
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="🔐 Camera Password Encryption/Decryption Test" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Plain Text Input */}
          <Row gutter={16}>
            <Col span={18}>
              <Input.Password
                placeholder="Nhập mật khẩu gốc (ví dụ: admin123)"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                onPressEnter={handleEncrypt}
              />
            </Col>
            <Col span={6}>
              <Button 
                type="primary" 
                onClick={handleEncrypt}
                loading={loading}
                block
              >
                🔒 Mã hóa
              </Button>
            </Col>
          </Row>

          {/* Encrypted Text */}
          <Row gutter={16}>
            <Col span={12}>
              <Input.TextArea
                placeholder="Mật khẩu đã mã hóa sẽ hiện ở đây..."
                value={encryptedText}
                onChange={(e) => setEncryptedText(e.target.value)}
                rows={3}
              />
            </Col>
            <Col span={6}>
              <Button 
                onClick={handleDecrypt}
                loading={loading}
                block
                style={{ marginBottom: '8px' }}
              >
                🔓 Giải mã
              </Button>
              <Button 
                onClick={handleAutoDecrypt}
                loading={loading}
                block
                style={{ marginBottom: '8px' }}
              >
                🤖 Auto Giải mã
              </Button>
              <Button 
                onClick={checkEncryptionStatus}
                block
              >
                🔍 Kiểm tra
              </Button>
            </Col>
            <Col span={6}>
              <Input.Password
                placeholder="Kết quả giải mã..."
                value={decryptedText}
                readOnly
              />
            </Col>
          </Row>

          {/* Sample Data */}
          <Card size="small" title="📋 Dữ liệu mẫu để test">
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Mật khẩu gốc mẫu:</strong></p>
                <ul>
                  <li><code>admin123</code></li>
                  <li><code>camera_password</code></li>
                  <li><code>hikvision2024</code></li>
                </ul>
              </Col>
              <Col span={12}>
                <p><strong>Cách sử dụng:</strong></p>
                <ol>
                  <li>Nhập mật khẩu gốc và nhấn "Mã hóa"</li>
                  <li>Copy mật khẩu đã mã hóa vào ô thứ 2</li>
                  <li>Nhấn "Giải mã" hoặc "Auto Giải mã"</li>
                  <li>Kiểm tra kết quả ở ô cuối</li>
                </ol>
              </Col>
            </Row>
          </Card>

          {/* Status */}
          {encryptedText && (
            <Card size="small" style={{ backgroundColor: isEncrypted(encryptedText) ? '#f6ffed' : '#fff2e8' }}>
              <p>
                <strong>Trạng thái:</strong> {' '}
                {isEncrypted(encryptedText) ? (
                  <span style={{ color: '#52c41a' }}>✅ Mật khẩu hợp lệ đã mã hóa</span>
                ) : (
                  <span style={{ color: '#fa8c16' }}>⚠️ Không phải mật khẩu đã mã hóa</span>
                )}
              </p>
              {isEncrypted(encryptedText) && (
                <p style={{ fontSize: '12px', color: '#666' }}>
                  IV Length: {encryptedText.split(':')[0]?.length || 0} chars | 
                  Encrypted Length: {encryptedText.split(':')[1]?.length || 0} chars
                </p>
              )}
            </Card>
          )}

        </Space>
      </Card>
    </div>
  );
};

export default CryptoTest;
