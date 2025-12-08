import { PERMISSIONS, hasPermission } from './permissions';

/**
 * Lấy route mặc định dựa trên role của user
 * @param {string} userRole - Role của user
 * @returns {string} - Route mặc định
 */
export const getDefaultRouteForRole = (userRole) => {
  // SuperAdmin và Supervisor -> Dashboard
  if (hasPermission(userRole, PERMISSIONS.DASHBOARD)) {
    return '/dashboard';
  }
  
  // Admin và User -> Vehicles (phương tiện)
  if (hasPermission(userRole, PERMISSIONS.VEHICLES)) {
    return '/vehicles';
  }
  
  // Fallback - settings
  return '/change-password';
};

/**
 * Kiểm tra xem route hiện tại có hợp lệ với role không
 * @param {string} userRole - Role của user  
 * @param {string} currentRoute - Route hiện tại
 * @returns {boolean}
 */
export const isValidRouteForRole = (userRole, currentRoute) => {
  // Các route không cần kiểm tra permission
  const publicRoutes = ['/login', '/change-password', '/'];
  if (publicRoutes.includes(currentRoute)) {
    return true;
  }
  
  // Kiểm tra permission cho route
  switch (currentRoute) {
    case '/dashboard':
      return hasPermission(userRole, PERMISSIONS.DASHBOARD);
    case '/vehicles':
      return hasPermission(userRole, PERMISSIONS.VEHICLES);
    case '/access-logs':
      return hasPermission(userRole, PERMISSIONS.ACCESS_LOGS);
    case '/users':
      return hasPermission(userRole, PERMISSIONS.USERS);
    case '/working-hours-requests':
      return hasPermission(userRole, PERMISSIONS.APPROVE_REQUESTS);
    case '/working-hours-violations':
      return hasPermission(userRole, PERMISSIONS.WORKING_HOURS_VIOLATIONS);
    case '/personal-working-hours-requests':
      return hasPermission(userRole, PERMISSIONS.WORKING_HOURS_REQUESTS);
    case '/personal-vehicles':
      return hasPermission(userRole, PERMISSIONS.PERSONAL_VEHICLES);
    default:
      return true; // Các route khác tạm thời cho phép
  }
};
