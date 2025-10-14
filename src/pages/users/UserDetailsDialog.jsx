
import React, { useEffect } from 'react';
import { Modal, Descriptions, Spin, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, clearUserDetails } from '../../store/userSlice';

const UserDetailsDialog = ({ visible, userId, onClose }) => {
    const dispatch = useDispatch();
    const { userDetails, userDetailsLoading, userDetailsError } = useSelector((state) => state.users);

    useEffect(() => {
        if (visible && userId) {
            dispatch(fetchUserById(userId));
        }
        if (!visible) {
            dispatch(clearUserDetails());
        }
    }, [visible, userId, dispatch]);

    return (
        <Modal
            title="Chi tiết người dùng"
            open={visible}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            {userDetailsLoading ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                    <Spin size="large" />
                </div>
                    ) : userDetailsError ? (
                        <Alert type="error" message={userDetailsError} />
                    ) : userDetails ? (
                        <Descriptions bordered column={1} size="middle">
                            <Descriptions.Item label="Username">{userDetails.username}</Descriptions.Item>
                            <Descriptions.Item label="Họ tên">{userDetails.name}</Descriptions.Item>
                            <Descriptions.Item label="SĐT">{userDetails.phone}</Descriptions.Item>
                            <Descriptions.Item label="Role">{userDetails.role}</Descriptions.Item>
                            <Descriptions.Item label="Active">{userDetails.isActive ? 'Active' : 'Inactive'}</Descriptions.Item>
                        </Descriptions>
                    ) : null}
        </Modal>
    );
};

export default UserDetailsDialog;