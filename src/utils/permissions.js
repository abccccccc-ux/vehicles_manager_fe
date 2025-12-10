// Định nghĩa các vai trò trong hệ thống
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  USER: 'user',
  SUPERVISOR: 'supervisor'
};

// Định nghĩa các quyền/chức năng
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  VEHICLES: 'vehicles',
  ACCESS_LOGS: 'access_logs', // Lịch sử ra/vào
  USERS: 'users', // Người dùng
  APPROVE_REQUESTS: 'approve_requests', // Phê duyệt yêu cầu ra/vào
  WORKING_HOURS_VIOLATIONS: 'working_hours_violations', // Vi phạm giờ làm việc
  WORKING_HOURS_REQUESTS: 'working_hours_requests', // Yêu cầu ra vào
  PERSONAL_VEHICLES: 'personal_vehicles', // Phương tiện cá nhân
  WORKING_HOURS: 'working_hours', // Giờ làm việc
  DEPARTMENT: 'department', // Đơn vị
  CAMERAS: 'cameras', // Quản lý camera
  SETTINGS: 'settings' // Cài đặt/Đổi mật khẩu
};

// Mapping quyền theo vai trò
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.VEHICLES,
    PERMISSIONS.ACCESS_LOGS,
    PERMISSIONS.USERS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.WORKING_HOURS_VIOLATIONS,
    PERMISSIONS.WORKING_HOURS_REQUESTS,
    PERMISSIONS.PERSONAL_VEHICLES,
    PERMISSIONS.WORKING_HOURS,
    PERMISSIONS.DEPARTMENT,
    PERMISSIONS.CAMERAS,
    PERMISSIONS.SETTINGS
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VEHICLES,
    PERMISSIONS.ACCESS_LOGS,
    PERMISSIONS.USERS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.WORKING_HOURS_VIOLATIONS,
    PERMISSIONS.WORKING_HOURS_REQUESTS,
    PERMISSIONS.PERSONAL_VEHICLES,
    PERMISSIONS.SETTINGS
  ],
  [ROLES.USER]: [
    PERMISSIONS.VEHICLES,
    PERMISSIONS.ACCESS_LOGS,
    PERMISSIONS.USERS,
    PERMISSIONS.WORKING_HOURS_VIOLATIONS,
    PERMISSIONS.WORKING_HOURS_REQUESTS,
    PERMISSIONS.PERSONAL_VEHICLES,
    PERMISSIONS.SETTINGS
  ],
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.VEHICLES,
    PERMISSIONS.ACCESS_LOGS,
    PERMISSIONS.USERS,
    PERMISSIONS.SETTINGS
  ]
};

// Mapping từ route đến permission
export const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.DASHBOARD,
  '/vehicles': PERMISSIONS.VEHICLES,
  '/access-logs': PERMISSIONS.ACCESS_LOGS,
  '/users': PERMISSIONS.USERS,
  '/working-hours-requests': PERMISSIONS.APPROVE_REQUESTS,
  '/working-hours-violations': PERMISSIONS.WORKING_HOURS_VIOLATIONS,
  '/personal-working-hours-requests': PERMISSIONS.WORKING_HOURS_REQUESTS,
  '/personal-vehicles': PERMISSIONS.PERSONAL_VEHICLES,
  '/working-hours': PERMISSIONS.WORKING_HOURS,
  '/departments': PERMISSIONS.DEPARTMENT,
  '/change-password': PERMISSIONS.SETTINGS
};

/**
 * Kiểm tra user có quyền truy cập không
 * @param {string} userRole - Vai trò của user
 * @param {string} permission - Quyền cần kiểm tra
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  return rolePermissions.includes(permission);
};

/**
 * Kiểm tra user có quyền truy cập route không
 * @param {string} userRole - Vai trò của user
 * @param {string} route - Route cần kiểm tra
 * @returns {boolean}
 */
export const hasRoutePermission = (userRole, route) => {
  const permission = ROUTE_PERMISSIONS[route];
  if (!permission) return true; // Route không cần permission đặc biệt
  
  return hasPermission(userRole, permission);
};

/**
 * Lấy danh sách tất cả quyền của một vai trò
 * @param {string} userRole - Vai trò của user
 * @returns {string[]}
 */
export const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Kiểm tra xem user có phải là admin cấp cao không
 * @param {string} userRole - Vai trò của user
 * @returns {boolean}
 */
export const isHighLevelAdmin = (userRole) => {
  return userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;
};

/**
 * Kiểm tra xem user có quyền quản lý không
 * @param {string} userRole - Vai trò của user
 * @returns {boolean}
 */
export const isManagerRole = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR].includes(userRole);
};
