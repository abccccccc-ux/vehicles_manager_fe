import React, { useEffect, useState } from 'react';
import { Card, Table, Row, Col, Empty, Tag, Space, Button, Tooltip, message } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import ApproveConfirm from '../../components/ApproveConfirm';
import RejectConfirm from '../../components/RejectConfirm';
import showDeleteConfirm from '../../components/DeleteConfirm';
import MainLayout from '../../layouts/MainLayout';
import SearchFilter from '../../components/Search/SearchFilter';
import SearchInput from '../../components/Search/SearchInput';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatDate';
import {
    fetchAllWorkingHoursRequests,
    setPagination,
    setFilters,
    approveWorkingHoursRequest,
    rejectWorkingHoursRequest,
    deleteWorkingHoursRequest,
} from '../../store/workingHoursRequestSlice';
import { render } from '@testing-library/react';

const statusOptions = [
    { label: 'Chờ phê duyệt', value: 'pending' },
    { label: 'Đã phê duyệt', value: 'approved' },
    { label: 'Đã từ chối', value: 'rejected' },
];

const requestTypeOptions = [
    { label: 'Cả hai', value: 'both' },
    { label: 'Ra', value: 'exit' },
    { label: 'Vào', value: 'enter' },
];

const statusTag = (status) => {
    if (!status) return null;
    const map = {
        pending: { color: 'orange', text: 'Chờ phê duyệt' },
        approved: { color: 'green', text: 'Đã phê duyệt' },
        rejected: { color: 'red', text: 'Đã từ chối' },
    };
    const s = map[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
};

const requestTypeTag = (requestType) => {
    if(!requestType) return null;
    const map = {
        both: {text: 'Cả hai'},
        exit: {text: 'Ra'},
        enter: {text: 'Vào'}
    }
    const r = map[requestType] || {text: requestType};
    return r.text;
}

const columns = (onApprove, onReject, onDelete) => [
    { title: 'Người yêu cầu', dataIndex: ['requestedBy', 'name'], key: 'requestedBy' },
    { title: 'Mã nhân viên', dataIndex: ['requestedBy', 'employeeId'], key: 'employeeId' },
    { title: 'Số điện thoại', dataIndex: ['requestedBy', 'phone'], key: 'phone' },
    { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
    { title: 'Loại yêu cầu', dataIndex: 'requestType', key: 'requestType', render: requestTypeTag },
    { title: 'Thời gian dự kiến', dataIndex: 'plannedDateTime', key: 'plannedDateTime', render: (d) => formatDate(d) },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: statusTag },
    { title: 'Ghi chú', dataIndex: 'reason', key: 'reason' },
    {
        title: 'Hành động',
        key: 'actions',
        render: (_, record) => {
            const actions = [];
            
            // Chỉ hiển thị phê duyệt/từ chối khi trạng thái là pending
            if (record.status === 'pending') {
                actions.push(
                    <Tooltip title="Phê duyệt" key="approve">
                        <Button type="primary" icon={<CheckOutlined />} onClick={() => onApprove(record)} />
                    </Tooltip>
                );
                actions.push(
                    <Tooltip title="Từ chối" key="reject">
                        <Button danger icon={<CloseOutlined />} onClick={() => onReject(record)} />
                    </Tooltip>
                );
            }
            return actions.length > 0 ? <Space>{actions}</Space> : null;
        },
    },
];

const WorkingHoursRequestList = () => {
    const dispatch = useDispatch();
    const { list = [], loading, pagination, filters } = useSelector((s) => s.workingHoursRequests || {});

    const [approveVisible, setApproveVisible] = useState(false);
    const [rejectVisible, setRejectVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [licensePlate, setLicensePlate] = useState(filters?.licensePlate || '');
    const debouncedLicensePlate = useDebounce(licensePlate, 400);

    useEffect(() => {
        const params = {
            page: pagination?.current,
            limit: pagination?.pageSize,
        };

        if (filters?.status) params.status = filters.status;
        if (filters?.requestType) params.requestType = filters.requestType;
        if (filters?.licensePlate) params.licensePlate = filters.licensePlate;

        dispatch(fetchAllWorkingHoursRequests(params));
    }, [dispatch, pagination?.current, pagination?.pageSize, filters?.status, filters?.requestType, filters?.search]);

    useEffect(() => {
        // Do not set an empty string as licensePlate filter — use undefined instead
        dispatch(setFilters({ licensePlate: debouncedLicensePlate || undefined }));
    }, [debouncedLicensePlate, dispatch]);

    const handleTableChange = (pag) => {
        dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
    };

    const onStatusChange = (val) => {
        dispatch(setFilters({ status: val }));
    };

    const onRequestTypeChange = (val) => {
        dispatch(setFilters({ requestType: val }));
    };

    const openApprove = (record) => {
        setSelectedRecord(record);
        setApproveVisible(true);
    };

    const openReject = (record) => {
        setSelectedRecord(record);
        setRejectVisible(true);
    };

    const openDelete = (record) => {
        showDeleteConfirm({
            message: `Bạn có chắc chắn muốn xóa yêu cầu của ${record.requestedBy?.name || 'người dùng'} với biển số ${record.licensePlate}?`,
            onOk: () => handleDelete(record._id),
        });
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteWorkingHoursRequest(id)).unwrap();
            message.success('Xóa yêu cầu thành công');
        } catch (e) {
            message.error(e?.message || 'Lỗi khi xóa yêu cầu');
        }
    };

    const handleApprove = async (approvalNote) => {
        if (!selectedRecord) return;
        try {
            await dispatch(approveWorkingHoursRequest({ id: selectedRecord._id, approvalNote })).unwrap();
            message.success('Phê duyệt yêu cầu thành công');
            setApproveVisible(false);
            setSelectedRecord(null);
        } catch (e) {
            message.error(e?.message || 'Lỗi khi phê duyệt yêu cầu');
        }
    };

    const handleReject = async (approvalNote) => {
        if (!selectedRecord) return;
        try {
            await dispatch(rejectWorkingHoursRequest({ id: selectedRecord._id, approvalNote })).unwrap();
            message.success('Từ chối yêu cầu thành công');
            setRejectVisible(false);
            setSelectedRecord(null);
        } catch (e) {
            console.log(e);
            message.error(e?.message || 'Yêu cầu nhập lý do');
        }
    };

    return (
        <MainLayout>
            <Card title="Danh sách yêu cầu ra/vào giờ hành chính">
                <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <SearchInput value={licensePlate} onChange={setLicensePlate} placeholder="Tìm tên / biển số" />
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <SearchFilter
                            value={filters?.status}
                            onChange={onStatusChange}
                            options={statusOptions}
                            placeholder="Trạng thái"
                            style={{ minWidth: 132 }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <SearchFilter
                            value={filters?.requestType}
                            onChange={onRequestTypeChange}
                            options={requestTypeOptions}
                            placeholder="Loại yêu cầu"
                        />
                    </Col>
                </Row>


                {list && list.length > 0 ? (
                    <>
                        <Table
                            rowKey="_id"
                            columns={columns(openApprove, openReject, openDelete)}
                            dataSource={list}
                            loading={loading}
                            pagination={pagination}
                            onChange={handleTableChange}
                            bordered
                        />
                        <ApproveConfirm visible={approveVisible} onCancel={() => setApproveVisible(false)} onConfirm={handleApprove} confirmLoading={loading} />
                        <RejectConfirm visible={rejectVisible} onCancel={() => setRejectVisible(false)} onConfirm={handleReject} confirmLoading={loading} />
                    </>
                ) : (
                    <Empty description={loading ? 'Đang tải...' : 'Không có yêu cầu'} />
                )}
            </Card>
        </MainLayout>
    );
};

export default WorkingHoursRequestList;