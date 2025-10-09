import React, { useEffect } from 'react';
import { notification } from 'antd';

/**
 * AlertMessage (compat component)
 * When rendered it will open an antd notification at bottomRight for 5 seconds.
 * Props: { type: 'success'|'error'|'info'|'warning', message: string }
 */
const AlertMessage = ({ type = 'success', message }) => {
  useEffect(() => {
    if (!message) return;
    const key = `alert_${Date.now()}`;
    const config = {
      message: message,
      placement: 'bottomRight',
      duration: 5,
      key,
    };

    // use specific notification type if available
    if (typeof notification[type] === 'function') {
      notification[type](config);
    } else {
      notification.open(config);
    }

    return () => {
      try {
        notification.close(key);
      } catch (e) {}
    };
  }, [type, message]);

  // nothing to render inline; notification handles UI
  return null;
};

export default AlertMessage;
