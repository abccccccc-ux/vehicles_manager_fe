import { useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Card, Typography, Space, Button, Tooltip, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import AccessLogTable from '../access-log/AccessLogTable';
import { fetchAccessLogs } from '../../store/accessLogSlice';
import { useAccessLogs } from '../../hooks/useAccessLogs';
import useSocket from '../../hooks/useSocket';

const { Title, Text } = Typography;

const AccessLogList = () => {
    const dispatch = useDispatch();
    const { refreshAccessLogs } = useAccessLogs();
    const { socket, isConnected } = useSocket(process.env.REACT_APP_API_URL || 'http://localhost:5000');

    useEffect(() => {
        // initial fetch
        dispatch(fetchAccessLogs({ page: 1, limit: 10 }));
    }, [dispatch]);

    // Socket listener cho access log mới
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleAccessLogCreated = (data) => {
            console.log('🎉 New access log created:', data);
            
            // Refresh danh sách
            dispatch(fetchAccessLogs({ page: 1, limit: 10 }));
        };

        socket.on('access_log_created', handleAccessLogCreated);

        console.log('👂 Socket listener registered for access_log_created');

        return () => {
            socket.off('access_log_created', handleAccessLogCreated);
        };
    }, [socket, isConnected, dispatch]);

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