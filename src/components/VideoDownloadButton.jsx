import React from 'react';
import { Button, Tag, Space } from 'antd';
import { DownloadOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';

/**
 * VideoDownloadButton - Component đơn giản để tải video của access log
 * 
 * Props:
 * - videoUrl: Đường dẫn video từ recognitionData
 * - accessLogId: ID của access log (optional, cho tên file)
 * - style: CSS style cho container
 */
const VideoDownloadButton = ({ 
  videoUrl, 
  accessLogId,
  style = {}
}) => {
  if (!videoUrl) {
    return (
      <div style={{ 
        padding: 16, 
        textAlign: 'center',
        backgroundColor: '#fafafa',
        borderRadius: 4,
        border: '1px dashed #d9d9d9',
        ...style 
      }}>
        <VideoCameraOutlined style={{ fontSize: 24, color: '#999' }} />
        <p style={{ margin: '8px 0 0', color: '#666' }}>Không có video</p>
      </div>
    );
  }

  // Tạo URL đầy đủ
  const baseUrl = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5001';
  const fullVideoUrl = `${baseUrl}${videoUrl}`;
  
  // Lấy tên file từ đường dẫn
  const fileName = videoUrl.split('/').pop() || `video_${accessLogId || 'download'}.mp4`;

  const handleDownload = () => {
    // Mở link tải video trong tab mới
    const link = document.createElement('a');
    link.href = fullVideoUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fullVideoUrl, '_blank');
  };

  return (
    <div style={{ 
      padding: 16,
      backgroundColor: '#f5f5f5',
      borderRadius: 4,
      border: '1px solid #d9d9d9',
      ...style 
    }}>
      <div style={{ marginBottom: 12 }}>
        <Tag color="purple" icon={<VideoCameraOutlined />}>
          Video có sẵn
        </Tag>
      </div>
      
      <p style={{ 
        fontSize: 12, 
        color: '#666', 
        marginBottom: 12,
        wordBreak: 'break-all'
      }}>
        <strong>File:</strong> {fileName}
      </p>
      
      <Space>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Tải video
        </Button>
        <Button 
          icon={<PlayCircleOutlined />}
          onClick={handleOpenInNewTab}
        >
          Mở trong tab mới
        </Button>
      </Space>
    </div>
  );
};

export default VideoDownloadButton;
