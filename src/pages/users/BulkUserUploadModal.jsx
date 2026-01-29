import React, { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  Spin,
  Alert,
  Table,
  Tabs,
  Empty,
  Tag,
  message,
} from 'antd';
import {
  InboxOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { bulkUploadUsers, clearBulkUploadResult, fetchUsers } from '../../store/userSlice';
import userApi from '../../api/userApi';

const BulkUserUploadModal = ({ open, onClose, onRefresh }) => {
  const dispatch = useDispatch();
  const { bulkUploading, bulkUploadResult, bulkUploadError } = useSelector(
    (state) => state.users
  );

  const [file, setFile] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const handleFileChange = ({ file: newFile }) => {
    setFile(newFile);
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await userApi.downloadUserTemplate();
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      message.success('Tải template thành công');
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error('Vui lòng chọn file Excel');
      return;
    }

    setHasSubmitted(true);
    try {
      // Ant Design Upload component wraps the file in an object
      // We need to pass the original file object
      const fileToUpload = file.originFileObj || file;
      await dispatch(bulkUploadUsers(fileToUpload)).unwrap();
    } catch (err) {
      // Error is handled by Redux, show message
      message.error(err || 'Lỗi khi upload file');
    }
  };

  const handleClose = () => {
    setFile(null);
    setHasSubmitted(false);
    dispatch(clearBulkUploadResult());
    onClose();
  };

  const handleRefreshList = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    }
    handleClose();
  };

  const createdUsersColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
        title: 'Mật khẩu mặc định',
        dataIndex: 'password', // Assuming API returns 'password' or 'defaultPassword'
        key: 'password',
        render: (pwd) => (
          <Tag color="blue">
            {pwd || 'N/A'}
          </Tag>
        ),
      },
  ];

  const errorsColumns = [
    {
      title: 'Dòng',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Lỗi',
      dataIndex: 'error',
      key: 'error',
    },
  ];

  const renderContent = () => {
    if (bulkUploading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" tip="Đang upload file..." />
        </div>
      );
    }

    if (hasSubmitted && bulkUploadResult) {
      const { success, message: msg, data } = bulkUploadResult;
      const { summary = {}, createdUsers = [], errors = [] } = data || {};

      return (
        <div>
          <Alert
            message={msg}
            type={success ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 20 }}
          />

          {summary && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: '#666' }}>Tổng cộng</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {summary.total || 0}
                </div>
              </div>
              <div
                style={{
                  padding: '12px',
                  border: '1px solid #52c41a',
                  borderRadius: '4px',
                  textAlign: 'center',
                  backgroundColor: '#f6ffed',
                }}
              >
                <div style={{ fontSize: 12, color: '#52c41a' }}>Thành công</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {summary.success || 0}
                </div>
              </div>
              <div
                style={{
                  padding: '12px',
                  border: '1px solid #ff4d4f',
                  borderRadius: '4px',
                  textAlign: 'center',
                  backgroundColor: '#fff1f0',
                }}
              >
                <div style={{ fontSize: 12, color: '#ff4d4f' }}>Thất bại</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {summary.failed || 0}
                </div>
              </div>
            </div>
          )}

          <Tabs
            items={[
              {
                key: 'users',
                label: `Người dùng được tạo (${createdUsers.length})`,
                children:
                  createdUsers.length > 0 ? (
                    <Table
                      columns={createdUsersColumns}
                      dataSource={createdUsers.map((u, idx) => ({
                        ...u,
                        key: idx,
                      }))}
                      pagination={false}
                      scroll={{ x: 600 }}
                    />
                  ) : (
                    <Empty description="Không có người dùng nào được tạo" />
                  ),
              },
              {
                key: 'errors',
                label: `Lỗi (${errors.length})`,
                children:
                  errors.length > 0 ? (
                    <Table
                      columns={errorsColumns}
                      dataSource={errors.map((e, idx) => ({
                        ...e,
                        key: idx,
                      }))}
                      pagination={false}
                      scroll={{ x: 600 }}
                    />
                  ) : (
                    <Empty description="Không có lỗi nào" />
                  ),
              },
            ]}
          />
        </div>
      );
    }

    if (hasSubmitted && bulkUploadError) {
      const errorDescription = typeof bulkUploadError === 'object' 
        ? (bulkUploadError.message || JSON.stringify(bulkUploadError))
        : bulkUploadError;
        
      return (
        <Alert
          message="Lỗi"
          description={errorDescription}
          type="error"
          showIcon
        />
      );
    }

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            loading={downloadingTemplate}
            onClick={handleDownloadTemplate}
          >
            Tải template
          </Button>
        </div>
        
        <Upload.Dragger
          accept=".xlsx,.xls,.csv"
          maxCount={1}
          onChange={handleFileChange}
          beforeUpload={() => false}
        >
          <p style={{ fontSize: 48 }}>
            <InboxOutlined />
          </p>
          <p style={{ fontSize: 16 }}>
            Kéo thả file Excel vào đây hoặc click để chọn
          </p>
          <p style={{ color: '#666', fontSize: 12 }}>
            Hỗ trợ các định dạng: .xlsx, .xls, .csv
          </p>
        </Upload.Dragger>

        {file && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileExcelOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span style={{ flex: 1 }}>{file.name}</span>
              <Button
                type="text"
                danger
                size="small"
                onClick={() => setFile(null)}
              >
                Xóa
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const isLoading = bulkUploading;
  const showRefreshButton = hasSubmitted && bulkUploadResult?.success;

  return (
    <Modal
      title="Thêm mới người dùng hàng loạt"
      open={open}
      onCancel={handleClose}
      width={900}
      footer={
        showRefreshButton
          ? [
              <Button key="close" onClick={handleClose}>
                Đóng
              </Button>,
              <Button
                key="refresh"
                type="primary"
                onClick={handleRefreshList}
              >
                Làm mới danh sách
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={handleClose} disabled={isLoading}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={isLoading}
                onClick={handleUpload}
                disabled={!file || isLoading}
              >
                Upload
              </Button>,
            ]
      }
    >
      {renderContent()}
    </Modal>
  );
};

export default BulkUserUploadModal;
