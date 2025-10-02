import React, { useState, useEffect } from "react";
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

  // Danh sách items
  const allItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: <Link to="/vehicles">Danh sách xe</Link>,
      role: "super_admin",
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: <Link to="/history">Lịch sử ra/vào</Link>,
      role: "super_admin",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link to="/users">Người dùng</Link>,
      role: "super_admin",
    },
    {
      key: "departments",
      icon: <TeamOutlined />,
      label: <Link to="/departments">Phòng ban</Link>,
      role: "super_admin",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      children: [
        {
          key: "register-vehicle",
          icon: <PlusCircleOutlined />,
          label: <Link to="/register-vehicle">Thêm phương tiện cá nhân</Link>,
        },
        {
          key: "change-password",
          icon: <LockOutlined />,
          label: <Link to="/change-password">Đổi mật khẩu</Link>,
        },
      ],
    },
  ];

  // Lọc menu theo role
  const filterByRole = (item) => {
    if (!item.role) return true;
    return item.role === role;
  };

  const processItems = (items) =>
    items
      .filter(filterByRole)
      .map((item) =>
        item.children
          ? { ...item, children: processItems(item.children) }
          : item
      );

  const items = processItems(allItems);

  // Ban đầu đóng hết submenu
  const [openKeys, setOpenKeys] = useState([]);

  // Xử lý mở submenu theo route hiện tại
  useEffect(() => {
    if (
      location.pathname.startsWith("/register-vehicle") ||
      location.pathname.startsWith("/change-password")
    ) {
      setOpenKeys(["settings"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  // Khi người dùng click mở/đóng submenu
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys([]);
    }
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
