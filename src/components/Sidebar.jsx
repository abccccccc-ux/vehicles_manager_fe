import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DashboardOutlined,
  CarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

const Sidebar = ({ collapsed }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const role = user?.role;

  let items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
  ];

  if (role === 'super_admin') {
    items = items.concat([
      {
        key: 'vehicles',
        icon: <CarOutlined />,
        label: <Link to="/vehicles">Danh sách xe</Link>,
      },
      {
        key: 'history',
        icon: <HistoryOutlined />,
        label: <Link to="/history">Lịch sử ra/vào</Link>,
      },
    ]);
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname.replace('/', '') || 'dashboard']}
      items={items}
      inlineCollapsed={collapsed} // 👈 Khi collapse chỉ còn icon
    />
  );
};

export default Sidebar;
