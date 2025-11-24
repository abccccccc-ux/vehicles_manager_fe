import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../layouts/MainLayout";
import {
    fetchWorkingHoursRequests,
    setFilters,
    setPagination,
} from "../../store/workingHoursRequestSlice";
import { Table, DatePicker, Button, Space, Tag } from 'antd';
import AlertMessage from '../../components/AlertMessage';
import useRebounce from '../../hooks/useRebounce';
import SearchInput from '../../components/Search/SearchInput';
import SearchFilter from '../../components/Search/SearchFilter';

const STATUS_OPTIONS = ["pending", "approved", "rejected", "expired", "used"];
const REQUEST_TYPE_OPTIONS = ["entry", "exit", "both"];

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

        dispatch(fetchWorkingHoursRequests(params));
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
            render: (t) => <Tag>{t}</Tag>
        },
        {
            title: 'Thời gian dự kiến',
            dataIndex: 'plannedDateTime',
            key: 'plannedDateTime',
            render: (d) => d ? new Date(d).toLocaleString() : '-',
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
                return <Tag color={colorMap[statusVal] || 'default'}>{statusVal}</Tag>;
            }
        },
        {
            title: 'Người phê duyệt',
            dataIndex: ['approvedBy', 'name'],
            key: 'approvedBy',
            render: (n) => n || '-',
        },
    ], []);

    return (
        <MainLayout>
            <h2>Danh sách yêu cầu ra/vào cá nhân</h2>

            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Space wrap>
                    <SearchFilter
                        placeholder="Trạng thái"
                        value={status || undefined}
                        onChange={(v) => setStatus(v)}
                        style={{ width: 160 }}
                        options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
                    />

                    <SearchFilter
                        placeholder="Loại yêu cầu"
                        value={requestType || undefined}
                        onChange={(v) => setRequestType(v)}
                        style={{ width: 140 }}
                        options={REQUEST_TYPE_OPTIONS.map((r) => ({ label: r, value: r }))}
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
            </Space>
        </MainLayout>
    );
};

export default PersonalWorkingHoursRequestList;