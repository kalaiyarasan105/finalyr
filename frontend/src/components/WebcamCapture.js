import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import './WebcamCapture.css';

const WebcamCapture = forwardRef(({ 
  onCapture, 
  isActive = true, 
  width = 320, 
  height = 240,
  className = '',
  showControls = true 
}, ref) => {
  const webcamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Expose capture method to parent component
  useImperativeHandle(ref, () => ({
    capturePhoto: () => {
      if (webcamRef.current && hasPermission) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc && onCapture) {
          onCapture(imageSrc);
        }
        return imageSrc;
      }
      return null;
    },
    getScreenshot: () => {
      if (webcamRef.current && hasPermission) {
        return webcamRef.current.getScreenshot();
      }
      return null;
    }
  }));

  // Get available video devices
  const getVideoDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDevice) {
        // Prefer front camera if available
        const frontCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('front') || 
          device.label.toLowerCase().includes('user')
        );
        setSelectedDevice(frontCamera ? frontCamera.deviceId : videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting video devices:', err);
      setError('Failed to get camera devices');
    }
  }, [selectedDevice]);

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: width },
          height: { ideal: height }
        } 
      });
      
      setHasPermission(true);
      
      // Stop the stream immediately as webcam component will handle it
      stream.getTracks().forEach(track => track.stop());
      
      await getVideoDevices();
    } catch (err) {
      console.error('Camera permission error:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and refresh the page.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application.');
      } else {
        setError('Failed to access camera: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [width, height, getVideoDevices]);

  // Initialize camera on mount
  useEffect(() => {
    if (isActive) {
      requestPermission();
    }
  }, [isActive, requestPermission]);

  // Capture screenshot
  const capturePhoto = useCallback(() => {
    if (webcamRef.current && hasPermission) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && onCapture) {
        onCapture(imageSrc);
      }
      return imageSrc;
    }
    return null;
  }, [hasPermission, onCapture]);

  // Handle webcam ready
  const handleUserMedia = useCallback(() => {
    console.log('Webcam initialized successfully');
    setIsLoading(false);
    setError(null);
  }, []);

  // Handle webcam error
  const handleUserMediaError = useCallback((error) => {
    console.error('Webcam error:', error);
    setIsLoading(false);
    setHasPermission(false);
    
    let errorMessage = 'Failed to start camera';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please allow camera access.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found. Please connect a camera.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is being used by another application.';
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }
    
    setError(errorMessage);
  }, []);

  // Video constraints
  const videoConstraints = {
    width: width,
    height: height,
    facingMode: 'user',
    deviceId: selectedDevice ? { exact: selectedDevice } : undefined
  };

  if (!isActive) {
    return (
      <div className={`webcam-capture inactive ${className}`}>
        <div className="webcam-placeholder">
          <div className="camera-icon">📷</div>
          <p>Camera is off</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`webcam-capture loading ${className}`}>
        <div className="webcam-placeholder">
          <div className="loading-spinner"></div>
          <p>Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false || error) {
    return (
      <div className={`webcam-capture error ${className}`}>
        <div className="webcam-placeholder">
          <div className="error-icon">⚠️</div>
          <p>{error || 'Camera access denied'}</p>
          <button onClick={requestPermission} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`webcam-capture active ${className}`}>
      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          width={width}
          height={height}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="webcam-video"
        />
        
        <div className="webcam-overlay">
          <div className="face-detection-frame"></div>
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {showControls && (
        <div className="webcam-controls">
          {devices.length > 1 && (
            <select 
              value={selectedDevice || ''} 
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="device-selector"
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          )}
          
          <button onClick={capturePhoto} className="capture-btn">
            📸 Capture
          </button>
        </div>
      )}
    </div>
  );
});

export default WebcamCapture;