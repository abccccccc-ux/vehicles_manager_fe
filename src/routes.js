
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/vehicles/Vehicles';
import Login from './pages/auth/Login';
import History from './pages/History';
import Users from './pages/users/Users';
import ChangePassword from './pages/settings/ChangePassword';
import Departments from './pages/departments/Departments';
import WorkingHours from './pages/working-hours/WorkingHours';
import PersonalVehiclesList from './pages/personal-vehicles/PersonalVehiclesList';
import SecurityDashboard from './pages/SecurityDashboard';
import WorkingHoursRequestList from './pages/working-hours-requests/WorkingHoursRequestList';
import PersonalWorkingHoursRequestList from './pages/personal-working-hours-requests/PersonalWorkingHoursRequestList';
import AccessLogList from './pages/access-logs/AccessLogList';
import WorkingHoursViolations from './pages/working-hours-violations/WorkingHoursViolations';
import Cameras from './pages/cameras/Cameras';
import CryptoTest from './demo/CryptoTest';
import { PrivateRoute, RoleBasedRoute, RoutePermissionGuard } from './components/PermissionGuard';
import { PERMISSIONS } from './utils/permissions';
import { getDefaultRouteForRole } from './utils/routeUtils';

// Route được thay thế bằng components từ PermissionGuard

// Component để redirect thông minh dựa trên role
const SmartRedirect = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const defaultRoute = getDefaultRouteForRole(user?.role);
  return <Navigate to={defaultRoute} replace />;
};

const routes = [
  { path: '/', element: <SmartRedirect /> },
  { path: '/login', element: <Login /> },
  
  // Dashboard - chỉ SuperAdmin và Supervisor
  { 
    path: '/dashboard', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.DASHBOARD} fallbackPath="/vehicles">
      <Dashboard />
    </RoleBasedRoute> 
  },
  
  // Phương tiện - tất cả roles
  { 
    path: '/vehicles', 
    element: <RoutePermissionGuard route="/vehicles">
      <Vehicles />
    </RoutePermissionGuard> 
  },
  
  // Lịch sử ra/vào - tất cả roles
  { path: '/history', element: <PrivateRoute><History /></PrivateRoute> },
  { 
    path: '/access-logs', 
    element: <RoutePermissionGuard route="/access-logs">
      <AccessLogList />
    </RoutePermissionGuard> 
  },
  
  // Người dùng - SuperAdmin, Admin, User (không bao gồm Supervisor)
  { 
    path: '/users', 
    element: <RoutePermissionGuard route="/users">
      <Users />
    </RoutePermissionGuard> 
  },
  
  // Phê duyệt yêu cầu ra/vào - chỉ SuperAdmin và Admin
  { 
    path: '/working-hours-requests', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.APPROVE_REQUESTS}>
      <WorkingHoursRequestList />
    </RoleBasedRoute> 
  },
  
  // Vi phạm giờ làm việc - SuperAdmin, Admin, User
  { 
    path: '/working-hours-violations', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.WORKING_HOURS_VIOLATIONS}>
      <WorkingHoursViolations />
    </RoleBasedRoute> 
  },
  
  // Yêu cầu ra vào - SuperAdmin, Admin, User
  { 
    path: '/personal-working-hours-requests', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.WORKING_HOURS_REQUESTS}>
      <PersonalWorkingHoursRequestList />
    </RoleBasedRoute> 
  },
  
  // Phương tiện cá nhân - SuperAdmin, Admin, User
  { 
    path: '/personal-vehicles', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.PERSONAL_VEHICLES}>
      <PersonalVehiclesList />
    </RoleBasedRoute> 
  },

  // Quản lý camera - chỉ SuperAdmin
  { 
    path: '/cameras', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.CAMERAS}>
      <Cameras />
    </RoleBasedRoute> 
  },
  
  // Demo crypto test - chỉ SuperAdmin
  { 
    path: '/crypto-test', 
    element: <RoleBasedRoute requiredPermission={PERMISSIONS.CAMERAS}>
      <CryptoTest />
    </RoleBasedRoute> 
  },
  
  // Cài đặt - tất cả roles
  { 
    path: '/change-password', 
    element: <PrivateRoute>
      <ChangePassword />
    </PrivateRoute> 
  },
  
  // Các route khác vẫn giữ nguyên logic cũ
  { path: '/departments', element: <PrivateRoute><Departments/></PrivateRoute>},
  { path: '/working-hours', element: <PrivateRoute><WorkingHours/></PrivateRoute>},
  { path: '/security', element: <PrivateRoute><SecurityDashboard/></PrivateRoute>},
];

export default routes;
