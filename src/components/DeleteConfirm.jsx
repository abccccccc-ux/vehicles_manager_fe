import React from 'react';
import { Modal } from 'antd';

/**
 * showDeleteConfirm - helper to show antd Modal.confirm with a custom message
 * @param {Object} options
 * @param {string|React.Node} options.message - message to show inside the modal
 * @param {Function} [options.onOk] - callback when user confirms
 * @param {Function} [options.onCancel] - callback when user cancels
 */
const showDeleteConfirm = ({ message, onOk, onCancel }) => {
  Modal.confirm({
    title: 'Xác nhận',
    content: message,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: onOk,
    onCancel: onCancel,
  });
};

export default showDeleteConfirm;
