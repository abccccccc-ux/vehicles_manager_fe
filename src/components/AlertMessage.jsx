import React from 'react';
import { Alert } from 'antd';

const AlertMessage = ({ type = 'success', message }) => {
  return (
    <Alert
      message={message}
      type={type}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

export default AlertMessage;
