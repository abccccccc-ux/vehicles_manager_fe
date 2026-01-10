import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { List, Avatar, Button, Typography, Empty, Space, Tag } from 'antd';
import { DeleteOutlined, CarOutlined, ClockCircleOutlined, SafetyCertificateOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';
import { fetchNotifications, markNotificationRead, deleteNotification } from '../api/notificationApi';

const { Text } = Typography;

// Map notification types to icons and colors based on backend spec
const getTypeConfig = (type) => {
  const configs = {
    working_hours_request: { icon: <ClockCircleOutlined />, color: '#1890ff', label: 'Giờ làm việc' },
    working_hours_request_update: { icon: <ClockCircleOutlined />, color: '#52c41a', label: 'Cập nhật GH' },
    vehicle_verification: { icon: <SafetyCertificateOutlined />, color: '#fa8c16', label: 'Xác minh xe' },
    vehicle_verified: { icon: <SafetyCertificateOutlined />, color: '#52c41a', label: 'Đã xác minh' },
    vehicle_access: { icon: <CarOutlined />, color: '#1890ff', label: 'Ra/Vào' },
  };
  return configs[type] || { icon: <BellOutlined />, color: '#666', label: 'Thông báo' };
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#ff4d4f';
    case 'medium': return '#fa8c16';
    case 'low': return '#52c41a';
    default: return '#1890ff';
  }
};

const humanDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const diff = Math.floor((today.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / (1000*60*60*24));
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN');
};

const groupByDate = (items) => {
  const groups = {};
  items.forEach((it) => {
    const key = humanDateLabel(it.sentAt || it.createdAt || it.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(it);
  });
  return groups;
};

const NotificationList = ({
  initial = [],
  onOpen = () => {},
  onMarkRead = () => {},
  onRemove = () => {},
  pageSize = 10,
}) => {
  const [items, setItems] = useState(initial || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const resp = await fetchNotifications({ page: p, itemsPerPage: pageSize });
      const data = resp.data || [];
      const pagination = resp.pagination || {};
      if (p === 1) setItems(data);
      else setItems((s) => [...s, ...data]);
      setHasMore(!!pagination.hasNextPage);
      setPage(p);
    } catch (err) {
      // ignore, can show message later
      console.error('Load notifications error', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    // initial load
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // if parent changes initial data (e.g., via socket), update
    if (initial && initial.length) setItems(initial);
  }, [initial]);

  const handleOpen = async (item) => {
    try {
      if (!item.isRead) {
        // call api
        await markNotificationRead(item._id);
        // optimistic update
        setItems((s) => s.map(it => it._id === item._id ? { ...it, isRead: true } : it));
        try { onMarkRead(item._id); } catch (e) {}
      }
    } catch (err) {
      console.error('Mark read failed', err);
    }
    onOpen(item);
  };

  const handleRemove = async (id) => {
    try {
      await deleteNotification(id);
      setItems((s) => s.filter(it => it._id !== id));
      try { onRemove(id); } catch (e) {}
    } catch (err) {
      console.error('Delete notification failed', err);
    }
  };

  const grouped = useMemo(() => groupByDate(items), [items]);

  return (
    <div>
      {items.length === 0 ? (
        <Empty description="Không có thông báo" />
      ) : (
        Object.keys(grouped).map((dateKey) => (
          <div key={dateKey} style={{ marginBottom: 8 }}>
            <div style={{ padding: '8px 12px', color: '#666', fontSize: 12 }}>{dateKey}</div>
            <List
              dataSource={grouped[dateKey]}
              itemLayout="horizontal"
              split={false}
              renderItem={(item) => {
                const typeConfig = getTypeConfig(item.type);
                const priorityColor = getPriorityColor(item.priority);
                
                return (
                  <List.Item
                    key={item._id}
                    style={{
                      background: item.isRead ? 'transparent' : '#f0f8ff',
                      borderLeft: item.isRead ? 'none' : `4px solid ${priorityColor}`,
                      cursor: 'pointer',
                      padding: '12px',
                      marginBottom: '4px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleOpen(item)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(item); } }}
                    actions={[
                      <Button 
                        key="delete"
                        type="text" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item._id);
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            background: typeConfig.color,
                            color: '#fff'
                          }}
                        >
                          {typeConfig.icon}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600 }}>{item.title}</span>
                          {item.priority === 'high' && (
                            <Tag color="error" style={{ fontSize: '10px', margin: 0 }}>Quan trọng</Tag>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ color: '#666', marginBottom: '4px' }}>{item.message}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag color="default" style={{ fontSize: '10px', margin: 0 }}>
                              {typeConfig.label}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {new Date(item.sentAt || item.createdAt).toLocaleString('vi-VN')}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        ))
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', padding: 8 }}>
          <Button onClick={() => load(page + 1)} loading={loading}>Tải thêm</Button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
