import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Table, Row, Col, Button, Tag, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import SearchInput from '../../components/Search/SearchInput';
import AlertMessage from '../../components/AlertMessage';
import VehicleDetailsDialog from '../vehicles/VehicleDetailsDialog';
import RegisterVehicleDialog from './RegisterVehicle';
import { fetchMyVehicles, setSearch, setPagination, setSelectedVehicle } from '../../store/vehicleSlice';

const statusTag = (isActive) => (isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>);

const PersonalVehiclesList = () => {
    const dispatch = useDispatch();
    const { list, loading, pagination, search, error, selectedVehicle, detailLoading } = useSelector((state) => state.vehicle);

    const [showDetail, setShowDetail] = useState(false);
    const [alert, setAlert] = useState(null);
    const [registerVisible, setRegisterVisible] = useState(false);

    // fetch personal vehicles
    const load = useCallback(
        (page = pagination.current, pageSize = pagination.pageSize, q = search) => {
            dispatch(fetchMyVehicles({ page, limit: pageSize, search: q }));
        },
        [dispatch, pagination.current, pagination.pageSize, search]
    );

    useEffect(() => {
        load(pagination.current, pagination.pageSize, search);
    }, [load]);

    useEffect(() => {
        if (error) setAlert({ type: 'error', message: error });
    }, [error]);

    const columns = [
        { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
        { title: 'Tên xe', dataIndex: 'name', key: 'name' },
        { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
        { title: 'Màu', dataIndex: 'color', key: 'color' },
        { title: 'Ngày đăng ký', dataIndex: 'registrationDate', key: 'registrationDate', render: (d) => d ? new Date(d).toLocaleString('vi-VN') : '-' },
        { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: statusTag },
    ];

    const handleTableChange = (pag) => {
        dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
        load(pag.current, pag.pageSize, search);
    };

    const handleSearch = (val) => {
        dispatch(setSearch(val));
        load(1, pagination.pageSize, val);
    };

    const handleRowClick = (record) => {
        // reuse existing getVehicleByLicensePlate flow by setting selected vehicle key and opening dialog
        // For simplicity we set selectedVehicle directly (record contains full data from my-vehicles)
        dispatch(setSelectedVehicle(record));
        setShowDetail(true);
    };

    const closeDetail = () => {
        setShowDetail(false);
        dispatch(setSelectedVehicle(null));
    };

    const openRegister = () => setRegisterVisible(true);
    const closeRegister = () => setRegisterVisible(false);

    const onRegisterSuccess = (response) => {
        // show success alert and refresh list
        setAlert({ type: 'success', message: response.message || 'Đăng ký thành công' });
        closeRegister();
        // refresh current list
        load(1, pagination.pageSize, search);
    };

    return (
        <MainLayout>
            <Card title="Xe cá nhân của tôi">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end" align="middle">
                    <Col xs={24} sm={8} md={12} lg={8} style={{ display: 'flex', justifyContent: 'right' }}>
                        <Space wrap>
                            <Button onClick={openRegister} type="primary">Thêm phương tiện</Button>
                            <Button icon={<ReloadOutlined />} onClick={() => load(pagination.current, pagination.pageSize, search)}>
                                Tải lại
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {alert && <AlertMessage type={alert.type} message={alert.message} />}

                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={list}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                    bordered
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: 'pointer' },
                    })}
                />

                <VehicleDetailsDialog open={showDetail} onClose={closeDetail} vehicle={selectedVehicle} loading={detailLoading} />
                <RegisterVehicleDialog visible={registerVisible} onClose={closeRegister} onSuccess={onRegisterSuccess} />
            </Card>
        </MainLayout>
    );
};

export default PersonalVehiclesList;