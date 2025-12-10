import { useState, useEffect } from "react";
import { Menu, message, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from '../store/authSlice';
import { logout as logoutApi } from '../api/authApi';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import {
  DashboardOutlined,
  CarOutlined,
  HistoryOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  SnippetsOutlined,
  ExceptionOutlined,
  AlertOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const role = user?.role;

  // Danh sách items với permission mapping
  const allItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
      permission: PERMISSIONS.DASHBOARD,
    },
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: <Link to="/vehicles">Phương tiện</Link>,
      permission: PERMISSIONS.VEHICLES,
    },
    {
      key: "access-logs",
      icon: <HistoryOutlined />,
      label: <Link to="/access-logs">Lịch sử ra/vào</Link>,
      permission: PERMISSIONS.ACCESS_LOGS,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link to="/users">Người dùng</Link>,
      permission: PERMISSIONS.USERS,
    },
    {
      key: "departments",
      icon: <TeamOutlined />,
      label: <Link to="/departments">Đơn vị</Link>,
      permission: PERMISSIONS.DEPARTMENT,
    },
    {
      key: "working-hours",
      icon: <ClockCircleOutlined />,
      label: <Link to="/working-hours">Giờ làm việc</Link>,
      permission: PERMISSIONS.WORKING_HOURS,
    },
    {
      key: "working-hours-requests",
      icon: <SnippetsOutlined />,
      label: <Link to="/working-hours-requests">Phê duyệt Yêu cầu ra vào</Link>,
      permission: PERMISSIONS.APPROVE_REQUESTS,
    },
    {
      key: "working-hours-violations",
      icon: <AlertOutlined />,
      label: <Link to="/working-hours-violations">Vi phạm giờ làm việc</Link>,
      permission: PERMISSIONS.WORKING_HOURS_VIOLATIONS,
    },
    {
      key: "personal-working-hours-requests",
      icon: <ExceptionOutlined />,
      label: <Link to="/personal-working-hours-requests">Yêu cầu ra vào</Link>,
      permission: PERMISSIONS.WORKING_HOURS_REQUESTS,
    },
    {
      key: "personal-vehicles",
      icon: <CarOutlined />,
      label: <Link to="/personal-vehicles">Phương tiện cá nhân</Link>,
      permission: PERMISSIONS.PERSONAL_VEHICLES,
    },
    {
      key: "cameras",
      icon: <VideoCameraOutlined />,
      label: <Link to="/cameras">Quản lý Camera</Link>,
      permission: PERMISSIONS.CAMERAS,
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

  // Lọc menu theo permission
  const filterByPermission = (item) => {
    // Nếu không có permission requirement thì hiển thị
    if (!item.permission) return true;
    // Kiểm tra user có permission không
    const hasAccess = hasPermission(role, item.permission);
    
    // Debug log
    if (item.key === 'users') {
      console.log('Debug Users menu:', {
        role,
        permission: item.permission,
        hasAccess,
        user
      });
    }
    
    return hasAccess;
  };

  const processItems = (items) =>
    items
      .filter(filterByPermission)
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
