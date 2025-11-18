import React, { useEffect, useState } from 'react';
import { Card, Table, Row, Col, Empty, Tag, Select, Space } from 'antd';
import MainLayout from '../../layouts/MainLayout';
import SearchFilter from '../../components/Search/SearchFilter';
import SearchInput from '../../components/Search/SearchInput';
import AlertMessage from '../../components/AlertMessage';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatDate';
import {
    fetchWorkingHoursRequests,
    setPagination,
    setFilters,
} from '../../store/workingHoursRequestSlice';

const statusOptions = [
    { label: 'Tất cả', value: undefined },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

const requestTypeOptions = [
    { label: 'Tất cả', value: undefined },
    { label: 'Exit', value: 'exit' },
    { label: 'Enter', value: 'enter' },
];

const statusTag = (status) => {
    if (!status) return null;
    const map = {
        pending: { color: 'orange', text: 'Pending' },
        approved: { color: 'green', text: 'Approved' },
        rejected: { color: 'red', text: 'Rejected' },
    };
    const s = map[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
};

const columns = () => [
    { title: 'Người yêu cầu', dataIndex: ['requestedBy', 'name'], key: 'requestedBy' },
    { title: 'Mã nhân viên', dataIndex: ['requestedBy', 'employeeId'], key: 'employeeId' },
    { title: 'Số điện thoại', dataIndex: ['requestedBy', 'phone'], key: 'phone' },
    { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
    { title: 'Loại yêu cầu', dataIndex: 'requestType', key: 'requestType' },
    { title: 'Thời gian dự kiến', dataIndex: 'plannedDateTime', key: 'plannedDateTime', render: (d) => formatDate(d) },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: statusTag },
    { title: 'Ghi chú', dataIndex: 'reason', key: 'reason' },
];

const WorkingHoursRequestList = () => {
    const dispatch = useDispatch();
    const { list = [], loading, error, pagination, filters } = useSelector((s) => s.workingHoursRequests || {});

    const [search, setSearch] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        // fetch when filters or pagination change
        dispatch(
            fetchWorkingHoursRequests({
                page: pagination?.current,
                limit: pagination?.pageSize,
                status: filters?.status,
                requestType: filters?.requestType,
                search: filters?.search,
            })
        );
    }, [dispatch, pagination?.current, pagination?.pageSize, filters?.status, filters?.requestType, filters?.search]);

    // when debounced search changes, set filter and reset page
    useEffect(() => {
        dispatch(setFilters({ search: debouncedSearch }));
    }, [debouncedSearch, dispatch]);

    const handleTableChange = (pag) => {
        dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
    };

    const onStatusChange = (val) => {
        dispatch(setFilters({ status: val }));
    };

    const onRequestTypeChange = (val) => {
        dispatch(setFilters({ requestType: val }));
    };

    return (
        <MainLayout>
            <Card title="Danh sách yêu cầu ra/vào giờ hành chính">
                <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <SearchInput value={search} onChange={setSearch} placeholder="Tìm tên / biển số" />
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <SearchFilter
                            value={filters?.status}
                            onChange={onStatusChange}
                            options={statusOptions}
                            placeholder="Trạng thái"
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

                {error && (
                    <AlertMessage
                        type="error"
                        message={typeof error === 'string' ? error : error?.message || JSON.stringify(error)}
                    />
                )}

                {list && list.length > 0 ? (
                    <Table
                        rowKey="_id"
                        columns={columns()}
                        dataSource={list}
                        loading={loading}
                        pagination={pagination}
                        onChange={handleTableChange}
                        bordered
                    />
                ) : (
                    <Empty description={loading ? 'Đang tải...' : 'Không có yêu cầu'} />
                )}
            </Card>
        </MainLayout>
    );
};

export default WorkingHoursRequestList;