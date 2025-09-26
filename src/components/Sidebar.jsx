import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const role = user?.role;

  let items = [
    { key: 'dashboard', label: <Link to="/dashboard">Dashboard</Link> },
  ];

  if (role === 'super_admin') {
    items = items.concat([
      { key: 'vehicles', label: <Link to="/vehicles">Danh sách xe</Link> },
      { key: 'history', label: <Link to="/history">Lịch sử ra/vào</Link> },
    ]);
  }

  return (
    <aside className="h-full bg-white shadow p-2 min-w-[200px]">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname.replace('/', '') || 'dashboard']}
        items={items}
      />
    </aside>
  );
};

export default Sidebar;
