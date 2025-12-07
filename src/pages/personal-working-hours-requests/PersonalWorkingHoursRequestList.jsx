import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../layouts/MainLayout";
import {
    fetchMyWorkingHoursRequests,
    setFilters,
    setPagination,
} from "../../store/workingHoursRequestSlice";
import { Table, DatePicker, Button, Space, Tag } from 'antd';
import AlertMessage from '../../components/AlertMessage';
import useRebounce from '../../hooks/useRebounce';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';
import CreatePersonalWorkingHoursRequest from './CreatePersonalWorkingHoursRequest';
import EditPersonalWorkingHoursRequest from './EditPersonalWorkingHoursRequest';

const STATUS_OPTIONS = [
    { label: "Chờ duyệt", value: "pending" },
    { label: "Đã duyệt", value: "approved" },
    { label: "Từ chối", value: "rejected" },
    { label: "Hết hạn", value: "expired" },
    { label: "Đã sử dụng", value: "used" }
];

const REQUEST_TYPE_OPTIONS = [
    { label: "Vào", value: "entry" },
    { label: "Ra", value: "exit" },
    { label: "Cả hai", value: "both" }
];

const PersonalWorkingHoursRequestList = () => {
    const dispatch = useDispatch();
    const { list, loading, error, pagination, filters } = useSelector(
        (state) => state.workingHoursRequests
    );

    const [licensePlate, setLicensePlate] = useState(filters.licensePlate || "");
    const [status, setStatus] = useState(filters.status || "");
    const [requestType, setRequestType] = useState(filters.requestType || "");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);

    // build params and fetch when filters or pagination change
    useEffect(() => {
        const params = {
            page: pagination.current || 1,
            limit: pagination.pageSize || 20,
        };

        if (status) params.status = status;
        if (requestType) params.requestType = requestType;
        if (licensePlate) params.licensePlate = licensePlate;
        if (startDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0);
            params.startDate = s.toISOString();
        }
        if (endDate) {
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999);
            params.endDate = e.toISOString();
        }

        dispatch(fetchMyWorkingHoursRequests(params));
    }, [dispatch, pagination.current, pagination.pageSize, status, requestType, licensePlate, startDate, endDate]);

    const onSearch = () => {
        dispatch(setFilters({ status: status || undefined, requestType: requestType || undefined, licensePlate: licensePlate || undefined }));
        dispatch(setPagination({ current: 1 }));
    };

    // debounced filter helper
    const debouncedFilter = useRebounce((partial) => {
        dispatch(setFilters(partial));
        dispatch(setPagination({ current: 1 }));
    }, 600);

    const goPage = (page, pageSize) => {
        if (page < 1) return;
        dispatch(setPagination({ current: page, pageSize }));
    };

    // status is read-only in personal view

    const columns = useMemo(() => [
        {
            title: 'Biển số',
            dataIndex: 'licensePlate',
            key: 'licensePlate',
        },
        {
            title: 'Loại',
            dataIndex: 'requestType',
            key: 'requestType',
            render: (t) => {
                const typeMap = {
                    'entry': 'Vào',
                    'exit': 'Ra', 
                    'both': 'Cả hai'
                };
                return <Tag>{typeMap[t] || t}</Tag>
            }
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'plannedDateTime',
            key: 'plannedDateTime',
            render: (d) => d ? new Date(d).toLocaleString('vi-VN') : '-',
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'plannedEndDateTime',
            key: 'plannedEndDateTime',
            render: (d) => d ? new Date(d).toLocaleString('vi-VN') : '-',
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (statusVal) => {
                const colorMap = {
                    pending: 'orange',
                    approved: 'green',
                    rejected: 'red',
                    expired: 'default',
                    used: 'blue',
                };
                const statusMap = {
                    'pending': 'Chờ duyệt',
                    'approved': 'Đã duyệt',
                    'rejected': 'Từ chối',
                    'expired': 'Hết hạn',
                    'used': 'Đã sử dụng'
                };
                return <Tag color={colorMap[statusVal] || 'default'}>{statusMap[statusVal] || statusVal}</Tag>;
            }
        },
        {
            title: 'Người phê duyệt',
            dataIndex: ['approvedBy', 'name'],
            key: 'approvedBy',
            render: (n) => n || '-',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => {
                if (record.status === 'pending') {
                    return (
                        <Button 
                            size="small" 
                            type="link"
                            onClick={() => {
                                setEditingRequest(record);
                                setShowEditModal(true);
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                    );
                }
                return '-';
            }
        },
    ], []);

    return (
        <MainLayout>
            <h2>Danh sách yêu cầu ra/vào cá nhân</h2>

            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Space wrap>
                    <Button type="primary" onClick={() => setShowCreateModal(true)}>Tạo yêu cầu</Button>
                    <SearchFilter
                        placeholder="Trạng thái"
                        value={status || undefined}
                        onChange={(v) => setStatus(v)}
                        style={{ width: 160 }}
                        options={STATUS_OPTIONS}
                    />

                    <SearchFilter
                        placeholder="Loại yêu cầu"
                        value={requestType || undefined}
                        onChange={(v) => setRequestType(v)}
                        style={{ width: 140 }}
                        options={REQUEST_TYPE_OPTIONS}
                    />

                    <SearchInput
                        placeholder="Biển số"
                        value={licensePlate}
                        onChange={(val) => {
                            // update UI immediately
                            setLicensePlate(val);
                            // debounced server-side filter
                            debouncedFilter({ licensePlate: val });
                        }}
                        style={{ width: 240 }}
                    />

                    <DatePicker.RangePicker
                        onChange={(dates) => {
                            if (!dates) {
                                setStartDate('');
                                setEndDate('');
                                return;
                            }
                            const [s, e] = dates;
                            setStartDate(s.startOf('day').toDate().toISOString().slice(0, 10));
                            setEndDate(e.endOf('day').toDate().toISOString().slice(0, 10));
                        }}
                    />

                    <Button type="primary" onClick={onSearch}>Tìm kiếm</Button>
                </Space>

                {error && <AlertMessage type="error" message={error} />}

                <Table
                    bordered
                    columns={columns}
                    dataSource={list}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        onChange: goPage,
                    }}
                />
                <CreatePersonalWorkingHoursRequest
                    visible={showCreateModal}
                    onCancel={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        // refresh list
                        dispatch(fetchMyWorkingHoursRequests({ page: 1, limit: pagination.pageSize }));
                    }}
                />
                
                <EditPersonalWorkingHoursRequest
                    visible={showEditModal}
                    request={editingRequest}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditingRequest(null);
                    }}
                    onUpdated={() => {
                        setShowEditModal(false);
                        setEditingRequest(null);
                        // refresh list
                        dispatch(fetchMyWorkingHoursRequests({ 
                            page: pagination.current, 
                            limit: pagination.pageSize 
                        }));
                    }}
                />
            </Space>
        </MainLayout>
    );
};

export default PersonalWorkingHoursRequestList;