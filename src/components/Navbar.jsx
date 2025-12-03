import React from 'react';
import { Layout, Tooltip } from 'antd';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const { Header } = Layout;

const Navbar = () => {
  return (
    <Header className="app-header" role="banner">
      <Tooltip title="Thông báo">
        <div className="nav-notification" aria-hidden="false">
          <NotificationCenter />
        </div>
      </Tooltip>
    </Header>
  );
};

export default Navbar;
