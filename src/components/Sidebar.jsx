import React, { useState } from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  DashboardOutlined,
  CarOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const role = user?.role;

  // Luôn mở submenu settings mặc định
  const [openKeys, setOpenKeys] = useState(["settings"]);

  let items = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      children: [
        {
          key: "register-vehicle",
          icon: <PlusCircleOutlined />,
          label: <Link to={"/register-vehicle"}>Thêm phương tiện cá nhân</Link>,
        },
        {
          key: "change-password",
          icon: <LockOutlined />,
          label: <Link to={"/change-password"}>Đổi mật khẩu</Link>,
        },
      ],
    },
  ];

  if (role === "super_admin") {
    items = items.concat([
      {
        key: "vehicles",
        icon: <CarOutlined />,
        label: <Link to="/vehicles">Danh sách xe</Link>,
      },
      {
        key: "history",
        icon: <HistoryOutlined />,
        label: <Link to="/history">Lịch sử ra/vào</Link>,
      },
      {
        key: "users",
        icon: <UserOutlined />,
        label: <Link to="/users">Người dùng</Link>,
      },
      {
        key: "departments",
        icon: <TeamOutlined />,
        label: <Link to="/departments">Phòng ban</Link>,
      },
    ]);
  }

  // Xử lý mở/đóng submenu
  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname.replace("/", "") || "dashboard"]}
      items={items}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
    />
  );
};

export default Sidebar;
