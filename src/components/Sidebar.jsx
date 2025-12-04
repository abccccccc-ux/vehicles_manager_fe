import React, { useState, useEffect } from "react";
import { Menu, message, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from '../store/authSlice';
import { logout as logoutApi } from '../api/authApi';
import {
  DashboardOutlined,
  CarOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  UnlockOutlined,
  LogoutOutlined,
  SnippetsOutlined,
  ExceptionOutlined,
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
      key: "access-logs",
      icon: <HistoryOutlined />,
      label: <Link to="/access-logs">Lịch sử ra/vào</Link>,
      role: "super_admin",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link to="/users">Quản lý Người dùng</Link>,
      role: "super_admin",
    },
    {
      key: "departments",
      icon: <TeamOutlined />,
      label: <Link to="/departments">Quản lý Đơn vị</Link>,
      role: "super_admin",
    },
    {
      key: "working-hours",
      icon: <ClockCircleOutlined />,
      label: <Link to="/working-hours">Quản lý Giờ làm việc</Link>,
      role: "super_admin",
    },
    {
      key: "working-hours-requests",
      icon: <SnippetsOutlined />,
      label: <Link to="/working-hours-requests">Quản lý Yêu cầu ra vào</Link>,
      role: "super_admin",
    },
    {
      key: "personal-working-hours-requests",
      icon: <ExceptionOutlined />,
      label: <Link to="/personal-working-hours-requests">Yêu cầu ra vào</Link>,
    },
    {
      key: "personal-vehicles",
      icon: <CarOutlined />,
      label: "Phương tiện cá nhân",
      label: <Link to="/personal-vehicles">Phương tiện cá nhân</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      children: [
        {
          key: "change-password",
          icon: <LockOutlined />,
          label: <Link to="/change-password">Đổi mật khẩu</Link>,
        },
        {
          key: "log-out",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
        }
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
    //Thêm các route của item con vào đây
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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key !== 'log-out') return;

    Modal.confirm({
      title: 'Bạn có chắc muốn đăng xuất?',
      content: 'Bạn sẽ cần đăng nhập lại để truy cập hệ thống.',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          // Try calling backend logout; ignore failure but proceed to clear local state
          await logoutApi();
        } catch (e) {
          // ignore error
        }

        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
        } catch (e) {}

        try { dispatch(logoutAction()); } catch (e) {}
        message.success('Đăng xuất thành công');
        navigate('/login');
      },
    });
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname.replace("/", "") || "dashboard"]}
      items={items}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick}
    />
  );
};

export default Sidebar;
