import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Row, Col, Button, notification, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';
import showDeleteConfirm from '../../components/DeleteConfirm';
import useRebounce from '../../hooks/useRebounce';
import cameraApi from '../../api/cameraApi';
import CameraEditModal from './CameraEditModal';
import RoiEditorModal from './RoiEditorModal';

const statusOptions = [
  { label: 'Hoạt động', value: true },
  { label: 'Tạm dừng', value: false },
];

const positionOptions = [
  { label: 'Lối vào', value: 'entry' },
  { label: 'Lối ra', value: 'exit' },
];

const CamerasList = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [positionFilter, setPositionFilter] = useState(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [localSearch, setLocalSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  
  // ROI Editor state
  const [showRoiEditor, setShowRoiEditor] = useState(false);
  const [roiCameraId, setRoiCameraId] = useState(null); // cameraId for streaming
  const [roiCameraMongoId, setRoiCameraMongoId] = useState(null); // _id for API
  const [roiCameraName, setRoiCameraName] = useState('');
  const [roiCameraRecognition, setRoiCameraRecognition] = useState(null); // recognition data

  // debounced dispatcher for search to avoid rapid requests while typing
  const debouncedSearch = useRebounce((val) => {
    // reset to first page when searching
    setPagination(prev => ({ ...prev, current: 1 }));
    setSearch(val);
  }, 400);

  // fetch data when search, filter, or pagination changes
  useEffect(() => {
    fetchCameras();
  }, [search, statusFilter, positionFilter, pagination.current, pagination.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep localSearch in sync if search is updated elsewhere
  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
        status: statusFilter !== undefined ? statusFilter : undefined,
        position: positionFilter || undefined,
      };
      const response = await cameraApi.getAllCameras(params);
      console.log("API Response:", response);

      let cameraData = [];
      let paginationData = null;

      // Handle the specific API response structure
      if (response && response.data && response.data.success && response.data.data) {
        if (Array.isArray(response.data.data.cameras)) {
          cameraData = response.data.data.cameras;
          paginationData = response.data.data.pagination;
        } else if (Array.isArray(response.data.data)) {
          cameraData = response.data.data;
        }
      }
      // Fallback for direct data response
      else if (response && response.data && Array.isArray(response.data)) {
        cameraData = response.data;
      }
      // Fallback for direct array response
      else if (Array.isArray(response)) {
        cameraData = response;
      }

      // Ensure cameraData is always an array
      if (!Array.isArray(cameraData)) {
        cameraData = [];
      }

      setCameras(cameraData.map((camera) => ({ ...camera, key: camera.cameraId || camera._id })));

      // Update pagination if available
      if (paginationData) {
        setPagination({
          current: paginationData.current || paginationData.currentPage || 1,
          pageSize: paginationData.pageSize || paginationData.itemsPerPage || 10,
          total: paginationData.total || paginationData.totalItems || 0,
        });
      } else {
        setPagination((prev) => ({
          ...prev,
          total: cameraData.length,
        }));
      }

      if (cameraData.length === 0) {
        notification.info({ message: "Chưa có camera nào trong hệ thống", placement: 'bottomRight' });
      } else {
        notification.success({ message: `Đã tải ${cameraData.length} camera thành công`, placement: 'bottomRight' });
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);

      // Check if it's a 404 or API not implemented
      if (error.response?.status === 404) {
        notification.warning({ message: "API endpoint chưa được triển khai", placement: 'bottomRight' });
        setCameras([]);
      } else if (error.response?.status === 401) {
        notification.error({ message: "Không có quyền truy cập API camera", placement: 'bottomRight' });
      } else {
        notification.error({ message: "Không thể tải danh sách camera", placement: 'bottomRight' });
        setCameras([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cameraId) => {
    try {
      const response = await cameraApi.deleteCamera(cameraId);

      if (response && response.success) {
        notification.success({ message: response.message || "Đã xóa camera thành công", placement: 'bottomRight' });
      } else {
        notification.success({ message: "Đã xóa camera thành công", placement: 'bottomRight' });
      }

      fetchCameras();
    } catch (error) {
      console.error("Error deleting camera:", error);
      if (error.response?.status === 404) {
        notification.warning({ message: "API xóa camera chưa được triển khai", placement: 'bottomRight' });
      } else if (error.response?.status === 401) {
        notification.error({ message: "Không có quyền xóa camera", placement: 'bottomRight' });
      } else {
        notification.error({ message: "Không thể xóa camera", placement: 'bottomRight' });
      }
    }
  };

  const handleTableChange = (pag) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize, total: pagination.total });
  };

  const handleEdit = (camera) => {
    setEditingCamera(camera);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setEditingCamera(null);
    setShowEditModal(true);
  };

  const columns = [
    {
      title: "ID Camera",
      dataIndex: "cameraId",
      key: "cameraId",
    },
    {
      title: "Tên Camera",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Vị trí",
      key: "location",
      render: (_, record) => (
        <div>
          <div>{record.location?.gateName || '-'}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.location?.position === "entry"
              ? "Lối vào"
              : record.location?.position === "exit"
              ? "Lối ra"
              : record.location?.position || '-'}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={record.status?.isActive ? "green" : "red"}>
          {record.status?.isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Địa chỉ IP",
      key: "ipAddress",
      render: (_, record) => (
        <code>
          {record.technical?.ipAddress}:{record.technical?.port}
        </code>
      ),
    },
    {
      title: "Nhận diện",
      key: "recognition",
      render: (_, record) => (
        <Tag color={record.recognition?.enabled ? "blue" : "default"}>
          {record.recognition?.enabled ? "Bật" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            loading={deletingId === record.cameraId}
            disabled={!record.status?.isActive}
            title={!record.status?.isActive ? 'Camera không hoạt động - không thể xóa' : ''}
            onClick={(e) => {
              e.stopPropagation();
              if (!record.status?.isActive) return;
              const confirmMessage = `Bạn có xác nhận xóa ${record.name}?`;
              showDeleteConfirm({
                message: confirmMessage,
                onOk: async () => {
                  try {
                    setDeletingId(record.cameraId);
                    await handleDelete(record.cameraId);
                    setDeletingId(null);
                  } catch (err) {
                    setDeletingId(null);
                    notification.error({ message: 'Lỗi', description: err.message || 'Xóa thất bại', placement: 'bottomRight' });
                  }
                },
              });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <Card 
      title="Quản lý Camera"
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchInput
            value={localSearch}
            onChange={(val) => {
              setLocalSearch(val);
              debouncedSearch(val);
            }}
            placeholder="Tìm kiếm tên, ID camera..."
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Trạng thái"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SearchFilter
            value={positionFilter}
            onChange={setPositionFilter}
            options={positionOptions}
            placeholder="Vị trí"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm Camera
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="cameraId"
        columns={columns}
        dataSource={cameras}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        onRow={(record) => ({
          onClick: () => handleEdit(record),
        })}
      />
      <CameraEditModal
        visible={showEditModal}
        camera={editingCamera}
        onClose={() => {
          setShowEditModal(false);
          setEditingCamera(null);
        }}
        onSuccess={(mongoId, isNewCamera, cameraName, cameraIdForStreaming) => {
          setShowEditModal(false);
          setEditingCamera(null);
          fetchCameras();
          
          // Show ROI configuration dialog for new cameras
          if (isNewCamera && mongoId) {
            Modal.confirm({
              title: 'Cấu hình vùng phát hiện',
              content: 'Bạn có muốn cấu hình vùng phát hiện (ROI) cho camera này ngay bây giờ?',
              okText: 'Có, cấu hình ngay',
              cancelText: 'Để sau',
              onOk: () => {
                setRoiCameraId(cameraIdForStreaming); // For streaming
                setRoiCameraMongoId(mongoId); // For API
                setRoiCameraName(cameraName || cameraIdForStreaming);
                setShowRoiEditor(true);
              }
            });
          }
        }}
        onOpenRoiEditor={(cameraId, cameraName, mongoId, recognition) => {
          setRoiCameraId(cameraId); // For streaming
          setRoiCameraMongoId(mongoId); // For API
          setRoiCameraName(cameraName || cameraId);
          setRoiCameraRecognition(recognition); // For preserving enabled/confidence
          setShowRoiEditor(true);
        }}
      />
      
      {/* ROI Editor Modal */}
      <RoiEditorModal
        visible={showRoiEditor}
        cameraId={roiCameraId}
        cameraMongoId={roiCameraMongoId}
        cameraName={roiCameraName}
        cameraRecognition={roiCameraRecognition}
        onClose={() => {
          setShowRoiEditor(false);
          setRoiCameraId(null);
          setRoiCameraMongoId(null);
          setRoiCameraName('');
          setRoiCameraRecognition(null);
        }}
        onSuccess={() => {
          setShowRoiEditor(false);
          setRoiCameraId(null);
          setRoiCameraMongoId(null);
          setRoiCameraName('');
          setRoiCameraRecognition(null);
          fetchCameras();
        }}
      />
    </Card>
  );
};

export default CamerasList;
