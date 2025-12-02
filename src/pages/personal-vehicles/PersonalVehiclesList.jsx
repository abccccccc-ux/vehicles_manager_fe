import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Table, Row, Col, Button, Tag, Space, notification, Tooltip } from 'antd';
import { ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import VehicleDetailsDialog from '../vehicles/VehicleDetailsDialog';
import RegisterVehicleDialog from './RegisterVehicle';
import UpdatePersonalVehicleDialog from './UpdatePersonalVehicleDialog';
import { fetchMyVehicles, setSearch, setPagination, setSelectedVehicle, setDetailLoading } from '../../store/vehicleSlice';
import vehicleApi from '../../api/vehicleApi';

const statusTag = (isActive) => (isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>);

const PersonalVehiclesList = () => {
    const dispatch = useDispatch();
    const { list, loading, pagination, search, error, selectedVehicle, detailLoading } = useSelector((state) => state.vehicle);

    const [showDetail, setShowDetail] = useState(false);
    const [registerVisible, setRegisterVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);

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
        if (error) notification.error({ message: 'Lỗi', description: error, placement: 'bottomRight' });
    }, [error]);
    // alert state removed: using antd notification instead

    const columns = [
        { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate' },
        { title: 'Tên xe', dataIndex: 'name', key: 'name' },
        { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
        { title: 'Màu', dataIndex: 'color', key: 'color' },
        { title: 'Ngày đăng ký', dataIndex: 'registrationDate', key: 'registrationDate', render: (d) => d ? new Date(d).toLocaleString('vi-VN') : '-' },
        { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: statusTag },
        {
            title: 'Hành động',
            key: 'actions',
            render: (text, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(setSelectedVehicle(record));
                                setEditVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                // Xử lý xóa sẽ làm sau theo yêu cầu
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleTableChange = (pag) => {
        dispatch(setPagination({ current: pag.current, pageSize: pag.pageSize }));
        load(pag.current, pag.pageSize, search);
    };

    const handleSearch = (val) => {
        dispatch(setSearch(val));
        load(1, pagination.pageSize, val);
    };

    const handleRowClick = async (record) => {
        // When clicking a row, fetch latest vehicle details by license plate
        dispatch(setDetailLoading(true));
        try {
            const res = await vehicleApi.getVehicleByLicensePlate(record.licensePlate);
            if (res && res.success) {
                dispatch(setSelectedVehicle(res.data));
                setShowDetail(true);
            } else {
                notification.error({ message: 'Lỗi', description: res.message || 'Không thể tải thông tin xe', placement: 'bottomRight' });
            }
        } catch (err) {
            notification.error({ message: 'Lỗi', description: err.message || 'Có lỗi khi gọi API', placement: 'bottomRight' });
        } finally {
            dispatch(setDetailLoading(false));
        }
    };

    const closeDetail = () => {
        setShowDetail(false);
        dispatch(setSelectedVehicle(null));
    };

    const openRegister = () => setRegisterVisible(true);
    const closeRegister = () => setRegisterVisible(false);

    const onRegisterSuccess = (response) => {
        // show success alert and refresh list
        notification.success({ message: 'Thành công', description: response.message || 'Đăng ký thành công', placement: 'bottomRight' });
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
                <UpdatePersonalVehicleDialog
                    visible={editVisible}
                    vehicle={selectedVehicle}
                    onClose={() => {
                        setEditVisible(false);
                        dispatch(setSelectedVehicle(null));
                    }}
                    onSuccess={() => {
                        // refresh list and close
                        setEditVisible(false);
                        dispatch(setSelectedVehicle(null));
                        load(1, pagination.pageSize, search);
                    }}
                />
            </Card>
        </MainLayout>
    );
};

export default PersonalVehiclesList;