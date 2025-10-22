
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/vehicles/Vehicles';
import Login from './pages/auth/Login';
import History from './pages/History';
import Users from './pages/users/Users';
import ChangePassword from './pages/settings/ChangePassword';
import Departments from './pages/departments/Departments';
import WorkingHours from './pages/working-hours/WorkingHours';
import PersonalVehiclesList from './pages/personal-vehicles/PersonalVehiclesList';

// Route bảo vệ
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route chỉ cho admin
const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || user.role !== 'super_admin') return <Navigate to="/" replace />;
  return children;
};

const routes = [
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <PrivateRoute><Dashboard /></PrivateRoute> },
  { path: '/vehicles', element: <PrivateRoute><Vehicles /></PrivateRoute> },
  { path: '/history', element: <PrivateRoute><History /></PrivateRoute> },
  { path: '/users', element: <AdminRoute><Users /></AdminRoute> },
  { path: '/change-password', element: <PrivateRoute><ChangePassword /></PrivateRoute>},
  { path: '/departments', element: <PrivateRoute><Departments/></PrivateRoute>},
  { path: '/working-hours', element: <PrivateRoute><WorkingHours/></PrivateRoute>},
  { path: '/personal-vehicles', element: <PrivateRoute><PersonalVehiclesList/></PrivateRoute>},
];

export default routes;
