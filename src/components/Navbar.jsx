import React from 'react';
import { Layout, Tooltip } from 'antd';
import NotificationCenter from './NotificationCenter';

const { Header } = Layout;

const Navbar = () => {
  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 64,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 999,
      }}
    >
      <Tooltip title="Thông báo">
        <div style={{ cursor: 'pointer' }}>
          <NotificationCenter />
        </div>
      </Tooltip>
    </Header>
  );
};

export default Navbar;
