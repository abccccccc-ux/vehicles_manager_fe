import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button, notification, Space } from 'antd';
import { SaveOutlined, ClearOutlined, CloseOutlined } from '@ant-design/icons';
import videoStreamService from '../../services/videoStreamService';
import cameraApi from '../../api/cameraApi';
import './RoiEditorModal.css';

const RoiEditorModal = ({ visible, cameraId, cameraMongoId, cameraName, cameraRecognition, onClose, onSuccess }) => {
  const streamCanvasRef = useRef(null);
  const roiCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });
  
  // ROI state
  const [roi, setRoi] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);

  // Handle stream status
  const handleStreamStatus = useCallback((data) => {
    if (data.cameraId === cameraId) {
      if (data.status === 'started' || data.status === 'already_streaming') {
        setIsStreaming(true);
      } else if (data.status === 'stopped' || data.status === 'error') {
        setIsStreaming(false);
      }
    }
  }, [cameraId]);

  // Handle frame update to get canvas size
  const handleFrameUpdate = useCallback((frameData) => {
    // When we receive frames, stream is definitely working
    if (!isStreaming) {
      setIsStreaming(true);
    }
    if (frameData.metadata) {
      const { width, height } = frameData.metadata;
      if (width && height) {
        setCanvasSize({ width, height });
      }
    }
  }, [isStreaming]);

  // Main effect for stream setup - only run when modal opens/closes or cameraId changes
  useEffect(() => {
    if (!visible || !cameraId) return;

    console.log(`🎥 ROI Editor: Setting up stream for camera ${cameraId}`);

    // Connect to service if not connected
    if (!videoStreamService.isConnectedToServer()) {
      videoStreamService.connect();
    }

    const handleConnected = () => {
      console.log('✅ ROI Editor: Connected to server');
      setIsConnected(true);
    };
    
    const handleDisconnected = () => {
      console.log('❌ ROI Editor: Disconnected from server');
      setIsConnected(false);
      setIsStreaming(false);
    };

    videoStreamService.on('connected', handleConnected);
    videoStreamService.on('disconnected', handleDisconnected);
    videoStreamService.on('stream_status', handleStreamStatus);

    // Check current connection status
    const connected = videoStreamService.isConnectedToServer();
    setIsConnected(connected);

    // Use setTimeout to ensure canvas is mounted after Modal animation
    const setupTimer = setTimeout(() => {
      if (streamCanvasRef.current) {
        console.log(`📱 ROI Editor: Registering canvas for ${cameraId}`, streamCanvasRef.current);
        
        videoStreamService.registerVideoElement(cameraId, streamCanvasRef.current, {
          autoResize: true,
          showMetadata: false,
          onFrameUpdate: handleFrameUpdate,
          onStreamStarted: () => {
            console.log(`🎬 ROI Editor: Stream started for ${cameraId}`);
            setIsStreaming(true);
          },
          onStreamStopped: () => {
            console.log(`🛑 ROI Editor: Stream stopped for ${cameraId}`);
            setIsStreaming(false);
          }
        });

        // Subscribe to stream
        if (videoStreamService.isConnectedToServer()) {
          console.log(`📺 ROI Editor: Subscribing to ${cameraId}`);
          videoStreamService.subscribeToCameraStream(cameraId, 'high');
        }
      } else {
        console.error('❌ ROI Editor: Canvas ref is null after timeout!');
      }
    }, 100); // Wait 100ms for Modal to fully render

    // Cleanup function
    return () => {
      console.log(`🧹 ROI Editor: Cleaning up stream for ${cameraId}`);
      clearTimeout(setupTimer);
      videoStreamService.off('connected', handleConnected);
      videoStreamService.off('disconnected', handleDisconnected);
      videoStreamService.off('stream_status', handleStreamStatus);
      videoStreamService.unsubscribeFromCameraStream(cameraId);
      setIsStreaming(false);
      setRoi(null);
    };
  }, [visible, cameraId]); // Only depend on visible and cameraId

  // Subscribe when connection is established after modal opens
  useEffect(() => {
    if (visible && cameraId && isConnected && !isStreaming && streamCanvasRef.current) {
      console.log(`🔄 ROI Editor: Late subscribe to ${cameraId}`);
      videoStreamService.subscribeToCameraStream(cameraId, 'high');
    }
  }, [isConnected]); // Only trigger when connection status changes

  // Draw ROI overlay
  useEffect(() => {
    if (!roiCanvasRef.current) return;

    const canvas = roiCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roi) {
      // Draw semi-transparent overlay outside ROI
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear the ROI area
      ctx.clearRect(roi.x, roi.y, roi.width, roi.height);
      
      // Draw ROI border
      ctx.strokeStyle = '#52c41a';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
      
      // Draw corner handles
      const handleSize = 8;
      ctx.fillStyle = '#52c41a';
      
      // Top-left
      ctx.fillRect(roi.x - handleSize/2, roi.y - handleSize/2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(roi.x + roi.width - handleSize/2, roi.y - handleSize/2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(roi.x - handleSize/2, roi.y + roi.height - handleSize/2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(roi.x + roi.width - handleSize/2, roi.y + roi.height - handleSize/2, handleSize, handleSize);
      
      // Draw label
      ctx.fillStyle = '#52c41a';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Vùng phát hiện (ROI)', roi.x + 5, roi.y - 8);
    }
  }, [roi, canvasSize]);

  // Get mouse position relative to canvas
  const getMousePos = (e) => {
    const canvas = roiCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setDrawStart(pos);
    setRoi(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;

    const pos = getMousePos(e);
    const newRoi = {
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      width: Math.abs(pos.x - drawStart.x),
      height: Math.abs(pos.y - drawStart.y)
    };
    setRoi(newRoi);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDrawStart(null);
  };

  // Clear ROI
  const handleClearRoi = () => {
    setRoi(null);
  };

  // Save ROI
  const handleSaveRoi = async () => {
    if (!roi || roi.width < 10 || roi.height < 10) {
      notification.warning({
        message: 'Vui lòng vẽ vùng phát hiện trước khi lưu',
        placement: 'bottomRight'
      });
      return;
    }

    setIsSaving(true);
    try {
      // Include existing recognition data to preserve enabled and confidence
      const roiData = {
        recognition: {
          enabled: cameraRecognition?.enabled ?? true,
          confidence: {
            threshold: cameraRecognition?.confidence?.threshold ?? 0.95,
            autoApprove: cameraRecognition?.confidence?.autoApprove ?? 0.95
          },
          roi: {
            x: roi.x,
            y: roi.y,
            width: roi.width,
            height: roi.height
          }
        }
      };

      // Use cameraMongoId (_id) for API call, fallback to cameraId
      const apiCameraId = cameraMongoId || cameraId;
      console.log('📝 ROI Editor: Saving ROI for camera:', apiCameraId);
      await cameraApi.updateCamera(apiCameraId, roiData);
      
      notification.success({
        message: 'Đã lưu vùng phát hiện thành công',
        placement: 'bottomRight'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving ROI:', error);
      notification.error({
        message: 'Không thể lưu vùng phát hiện',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
        placement: 'bottomRight'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    videoStreamService.unsubscribeFromCameraStream(cameraId);
    setIsStreaming(false);
    setRoi(null);
    onClose();
  };

  return (
    <Modal
      title={`Cấu hình vùng phát hiện - ${cameraName || cameraId}`}
      open={visible}
      onCancel={handleClose}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="roi-editor-container">
        {/* Canvas container */}
        <div className="roi-canvas-container" ref={containerRef}>
          {/* Stream canvas */}
          <canvas
            ref={streamCanvasRef}
            className="stream-canvas"
            width={canvasSize.width}
            height={canvasSize.height}
          />
          
          {/* ROI overlay canvas */}
          <canvas
            ref={roiCanvasRef}
            className="roi-overlay-canvas"
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Stream status overlay */}
          {!isStreaming && (
            <div className="stream-status-overlay">
              <div className="spinner" />
              <p>{isConnected ? 'Đang kết nối stream...' : 'Đang kết nối server...'}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="roi-instructions">
          <p>
            💡 <strong>Hướng dẫn:</strong> Click và kéo chuột trên video để vẽ vùng phát hiện hình chữ nhật
          </p>
        </div>

        {/* ROI Info Panel */}
        <div className="roi-info-panel">
          <h4>📐 Thông tin vùng phát hiện</h4>
          
          {roi ? (
            <div className="roi-coordinates">
              <div className="roi-coord-item">
                <span className="label">X</span>
                <span className="value">{roi.x}</span>
              </div>
              <div className="roi-coord-item">
                <span className="label">Y</span>
                <span className="value">{roi.y}</span>
              </div>
              <div className="roi-coord-item">
                <span className="label">Rộng</span>
                <span className="value">{roi.width}</span>
              </div>
              <div className="roi-coord-item">
                <span className="label">Cao</span>
                <span className="value">{roi.height}</span>
              </div>
            </div>
          ) : (
            <div className="roi-empty-state">
              <div className="icon">🎯</div>
              <p>Chưa có vùng phát hiện. Vẽ trên video để tạo.</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="roi-actions">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button 
              icon={<ClearOutlined />}
              onClick={handleClearRoi}
              disabled={!roi}
            >
              Xóa ROI
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleClose}
            >
              Bỏ qua
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveRoi}
              loading={isSaving}
              disabled={!roi}
            >
              Lưu ROI
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default RoiEditorModal;
