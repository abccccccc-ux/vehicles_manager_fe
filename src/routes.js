
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Login from './pages/Login';
import History from './pages/History';

// Route bảo vệ
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const routes = [
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <PrivateRoute><Dashboard /></PrivateRoute> },
  { path: '/vehicles', element: <PrivateRoute><Vehicles /></PrivateRoute> },
  { path: '/history', element: <PrivateRoute><History /></PrivateRoute> },
];

export default routes;
