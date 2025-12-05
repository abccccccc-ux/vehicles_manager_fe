import React, { useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Typography, Space, Button, Tooltip } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import AccessLogTable from '../access-log/AccessLogTable';
import { fetchAccessLogs } from '../../store/accessLogSlice';
import { useAccessLogs } from '../../hooks/useAccessLogs';

const { Title, Text } = Typography;

const AccessLogList = () => {
    const dispatch = useDispatch();
    const { refreshAccessLogs } = useAccessLogs();

    useEffect(() => {
        // initial fetch
        dispatch(fetchAccessLogs({ page: 1, limit: 10 }));
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchAccessLogs({ page: 1, limit: 10 }));
        // also trigger any service-level refresh if available
        refreshAccessLogs();
    };

    return (
        <MainLayout>
            <div style={{ padding: '8px 0' }}>
                <Card>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <Space direction="vertical" size={0}>
                            <Title level={3} style={{ margin: 0 }}>
                                Lịch sử Ra/Vào
                            </Title>
                            <Text type="secondary">Quản lý và theo dõi lịch sử ra/vào của các phương tiện</Text>
                        </Space>

                        <Space>
                            <Tooltip title="Làm mới dữ liệu">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    type="default"
                                >
                                    Làm mới
                                </Button>
                            </Tooltip>
                        </Space>
                    </div>

                    <AccessLogTable />
                </Card>
            </div>
        </MainLayout>
    );
};

export default AccessLogList;