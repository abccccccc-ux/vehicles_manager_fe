import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { hasRoutePermission, hasPermission } from '../utils/permissions';
import { getDefaultRouteForRole } from '../utils/routeUtils';

/**
 * Component bảo vệ route dựa trên authentication
 */
export const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Component bảo vệ route dựa trên role và permissions
 */
export const RoleBasedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallbackPath = null 
}) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra role cụ thể nếu được yêu cầu
  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = fallbackPath || getDefaultRouteForRole(user?.role);
    return <Navigate to={redirectPath} replace />;
  }
  
  // Kiểm tra permission cụ thể nếu được yêu cầu
  if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
    const redirectPath = fallbackPath || getDefaultRouteForRole(user?.role);
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

/**
 * Component bảo vệ route dựa trên đường dẫn
 */
export const RoutePermissionGuard = ({ 
  children, 
  route,
  fallbackPath = null 
}) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra quyền truy cập route
  if (!hasRoutePermission(user?.role, route)) {
    // Nếu không có fallbackPath được chỉ định, tự động tìm route phù hợp
    const redirectPath = fallbackPath || getDefaultRouteForRole(user?.role);
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

/**
 * HOC để bọc component với kiểm tra quyền
 */
export const withPermission = (WrappedComponent, permission) => {
  return function PermissionWrapper(props) {
    const { user } = useSelector(state => state.auth);
    
    if (!hasPermission(user?.role, permission)) {
      return <div>Bạn không có quyền truy cập chức năng này.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
};

/**
 * Hook để kiểm tra permission trong component
 */
export const usePermissions = () => {
  const { user, userPermissions } = useSelector(state => state.auth);
  
  const checkPermission = (permission) => {
    return hasPermission(user?.role, permission);
  };
  
  const checkRoute = (route) => {
    return hasRoutePermission(user?.role, route);
  };
  
  return {
    user,
    userPermissions,
    checkPermission,
    checkRoute,
    hasPermission: checkPermission,
    hasRoutePermission: checkRoute
  };
};
