import React from 'react';
import { Tag, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { ROLES } from '../utils/permissions';

const RoleDisplay = ({ showPermissions = false }) => {
  const { user, userPermissions } = useSelector(state => state.auth);
  
  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'red';
      case ROLES.ADMIN:
        return 'orange';
      case ROLES.SUPERVISOR:
        return 'blue';
      case ROLES.USER:
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case ROLES.ADMIN:
        return 'Admin';
      case ROLES.SUPERVISOR:
        return 'Supervisor';
      case ROLES.USER:
        return 'User';
      default:
        return role;
    }
  };

  const permissionsList = userPermissions.join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Tooltip title={showPermissions ? `Quyền: ${permissionsList}` : ''}>
        <Tag color={getRoleColor(user.role)}>
          {getRoleLabel(user.role)}
        </Tag>
      </Tooltip>
      {showPermissions && (
        <small style={{ color: '#666' }}>
          ({userPermissions.length} quyền)
        </small>
      )}
    </div>
  );
};

export default RoleDisplay;
