import React, { useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartmentById } from '../../store/departmentSlice';

const DepartmentDetailDialog = ({ visible, departmentId, onClose }) => {
  const dispatch = useDispatch();
  const { currentDepartment, currentDepartmentLoading, currentDepartmentError } = useSelector(
    (state) => state.departments
  );

  useEffect(() => {
    if (visible && departmentId) {
      dispatch(fetchDepartmentById(departmentId));
    }
  }, [visible, departmentId, dispatch]);

  return (
    <Modal
      title="Chi tiết đơn vị"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {currentDepartmentLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : currentDepartmentError ? (
        <div style={{ color: 'red' }}>{currentDepartmentError}</div>
      ) : currentDepartment ? (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Tên">{currentDepartment.name}</Descriptions.Item>
          <Descriptions.Item label="Mã">{currentDepartment.code}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {currentDepartment.isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Trưởng đơn vị">
            {currentDepartment.manager ? (
              <div>
                <div style={{ fontWeight: 600 }}>{currentDepartment.manager.name}</div>
                <div style={{ color: '#666' }}>{currentDepartment.manager.username}</div>
              </div>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Tạo bởi">
            {currentDepartment.createdBy ? (
              <div>
                <div style={{ fontWeight: 600 }}>{currentDepartment.createdBy.name}</div>
                <div style={{ color: '#666' }}>{currentDepartment.createdBy.username}</div>
              </div>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(currentDepartment.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(currentDepartment.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div>Không có dữ liệu</div>
      )}
    </Modal>
  );
};

export default DepartmentDetailDialog;
