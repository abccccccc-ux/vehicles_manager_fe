import React, { useEffect, useRef, useState } from 'react';
import './WebRTCPlayer.css';

/**
 * WebRTCPlayer Component
 * 
 * Stream camera từ MediaMTX qua WebRTC (WHEP protocol)
 * MediaMTX WebRTC URL format: http://localhost:8889/{cameraId}/whep
 * 
 * Độ trễ: ~0.5s (rất thấp, tốt cho real-time monitoring)
 */
const WebRTCPlayer = ({ 
  cameraId,
  cameraName = '',
  mediamtxUrl = 'http://localhost:8889',
  autoPlay = true,
  controls = true,
  className = '',
  onError,
  onPlay,
  onPause
}) => {
  const videoRef = useRef(null);
  const pcRef = useRef(null); // RTCPeerConnection
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionState, setConnectionState] = useState('new');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !cameraId) return;

    let pc = null;
    let restartTimeout = null;

    const startStream = async () => {
      try {
        console.log(`📺 [WebRTC] Starting stream for ${cameraId}`);
        setIsLoading(true);
        setError(null);

        // Create RTCPeerConnection
        pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          bundlePolicy: 'max-bundle'
        });
        pcRef.current = pc;

        // Add transceiver for receiving video
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        // Handle incoming tracks
        pc.ontrack = (event) => {
          console.log(`📹 [WebRTC] Received track for ${cameraId}:`, event.track.kind);
          
          if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
            console.log(`✅ [WebRTC] Video source set for ${cameraId}`);
          }
        };

        // Monitor connection state
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          console.log(`🔗 [WebRTC] Connection state for ${cameraId}:`, state);
          setConnectionState(state);

          if (state === 'failed' || state === 'disconnected' || state === 'closed') {
            console.warn(`⚠️ [WebRTC] Connection ${state} for ${cameraId}, will retry...`);
            setError(`Mất kết nối - Đang thử kết nối lại...`);
            
            // Restart after 3 seconds
            restartTimeout = setTimeout(() => {
              console.log(`🔄 [WebRTC] Restarting stream for ${cameraId}`);
              cleanup();
              startStream();
            }, 3000);
          } else if (state === 'connected') {
            console.log(`✅ [WebRTC] Connected for ${cameraId}`);
            setError(null);
            setIsLoading(false);
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log(`🧊 [WebRTC] ICE state for ${cameraId}:`, pc.iceConnectionState);
        };

        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to MediaMTX WHEP endpoint
        const whepUrl = `${mediamtxUrl}/${cameraId}/whep`;
        console.log(`📤 [WebRTC] Sending offer to ${whepUrl}`);

        const response = await fetch(whepUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        });

        if (!response.ok) {
          throw new Error(`WHEP endpoint error: ${response.status} ${response.statusText}`);
        }

        // Get answer from server
        const answerSdp = await response.text();
        console.log(`📥 [WebRTC] Received answer for ${cameraId}`);

        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: answerSdp,
        }));

        console.log(`🎬 [WebRTC] Stream setup complete for ${cameraId}`);

        // Auto play
        if (autoPlay) {
          setTimeout(() => {
            video.play()
              .then(() => {
                console.log(`▶️ [WebRTC] Auto-play started for ${cameraId}`);
                setIsPlaying(true);
              })
              .catch(err => {
                console.warn(`⚠️ [WebRTC] Auto-play failed for ${cameraId}:`, err);
                // Auto-play blocked by browser - not critical
              });
          }, 500);
        }

      } catch (err) {
        console.error(`❌ [WebRTC] Error for ${cameraId}:`, err);
        
        let errorMessage = 'Không thể kết nối stream';
        if (err.message.includes('404') || err.message.includes('WHEP endpoint error')) {
          errorMessage = 'Camera không khả dụng - Kiểm tra MediaMTX';
        } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
          errorMessage = 'Lỗi kết nối - Kiểm tra MediaMTX server';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        
        if (onError) {
          onError({ type: 'webrtc', message: errorMessage, details: err });
        }

        // Retry after 5 seconds
        restartTimeout = setTimeout(() => {
          console.log(`🔄 [WebRTC] Retrying stream for ${cameraId}`);
          cleanup();
          startStream();
        }, 5000);
      }
    };

    const cleanup = () => {
      console.log(`🧹 [WebRTC] Cleaning up ${cameraId}`);
      
      if (restartTimeout) {
        clearTimeout(restartTimeout);
        restartTimeout = null;
      }

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    };

    // Start streaming
    startStream();

    // Cleanup on unmount
    return () => {
      console.log(`🛑 [WebRTC] Component unmounting for ${cameraId}`);
      cleanup();
    };
  }, [cameraId, mediamtxUrl, autoPlay, onError]);

  // Video event handlers
  const handlePlay = () => {
    console.log(`▶️ [WebRTC] Video playing for ${cameraId}`);
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    console.log(`⏸️ [WebRTC] Video paused for ${cameraId}`);
    setIsPlaying(false);
    if (onPause) onPause();
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleRestart = () => {
    console.log(`🔄 [WebRTC] Restarting stream for ${cameraId}`);
    window.location.reload();
  };

  // Status Badge Component
  const StatusBadge = () => {
    if (connectionState === 'connected' && isPlaying) {
      return (
        <div className="status-badge status-live">
          <div className="status-dot"></div>
          <span>LIVE</span>
        </div>
      );
    } else if (connectionState === 'connecting') {
      return (
        <div className="status-badge status-connecting">
          <div className="status-dot"></div>
          <span>Connecting</span>
        </div>
      );
    } else {
      return (
        <div className="status-badge status-offline">
          <div className="status-dot"></div>
          <span>Offline</span>
        </div>
      );
    }
  };

  return (
    <div className={`webrtc-player ${className}`}>
      {/* Header */}
      <div className="webrtc-header">
        <div className="webrtc-info">
          <div className="webrtc-icon">
            <span>📹</span>
          </div>
          <div className="webrtc-details">
            <h3>{cameraName || `Camera ${cameraId}`}</h3>
            <p>ID: {cameraId}</p>
          </div>
        </div>
        
        <div className="webrtc-controls">
          <StatusBadge />
          <button onClick={handleRestart} className="restart-btn" title="Restart stream">
            🔄 Restart
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="webrtc-video-container">
        <video
          ref={videoRef}
          className="webrtc-video"
          controls={controls}
          playsInline
          autoPlay={autoPlay}
          muted
          onPlay={handlePlay}
          onPause={handlePause}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        />

        {/* Loading Overlay */}
        {isLoading && !error && (
          <div className="webrtc-overlay">
            <div className="overlay-content">
              <span className="overlay-icon waiting">⏳</span>
              <p className="overlay-title">Waiting for stream...</p>
              <p className="overlay-subtitle">{connectionState}</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="webrtc-overlay">
            <div className="overlay-content">
              <span className="overlay-icon">❌</span>
              <p className="overlay-title">{error}</p>
              <p className="overlay-subtitle">Check MediaMTX server connection</p>
              <button onClick={handleRestart} className="overlay-button">
                🔄 Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Disconnected Overlay */}
        {connectionState === 'disconnected' && !error && (
          <div className="webrtc-overlay">
            <div className="overlay-content">
              <span className="overlay-icon">📡</span>
              <p className="overlay-title">Server disconnected</p>
              <p className="overlay-subtitle">Trying to reconnect...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="webrtc-footer">
        <div className="footer-left">
          <span className="tech-badge">WebRTC</span>
          <span className="footer-text">Low Latency (~0.5s)</span>
        </div>
        <span className="footer-right">MediaMTX</span>
      </div>
    </div>
  );
};

export default WebRTCPlayer;

