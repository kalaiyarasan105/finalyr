import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './ProfessionalChat.css';

const ProfessionalChatInterface = () => {
  const webcamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [userText, setUserText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [emotionStats, setEmotionStats] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadConversations();
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-theme');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    calculateEmotionStats();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const calculateEmotionStats = () => {
    const stats = {};
    const userMessages = messages.filter(m => m.is_user_message && m.final_emotion);
    
    userMessages.forEach(msg => {
      const emotion = msg.final_emotion;
      if (!stats[emotion]) {
        stats[emotion] = { count: 0, totalConfidence: 0, intensities: {} };
      }
      stats[emotion].count++;
      stats[emotion].totalConfidence += msg.final_confidence || 0;
      
      const intensity = msg.emotion_intensity || 'medium';
      stats[emotion].intensities[intensity] = (stats[emotion].intensities[intensity] || 0) + 1;
    });

    // Calculate averages
    Object.keys(stats).forEach(emotion => {
      stats[emotion].avgConfidence = stats[emotion].totalConfidence / stats[emotion].count;
    });

    setEmotionStats(stats);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  const loadConversations = async () => {
    try {
      const data = await conversationAPI.getConversations();
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
        setMessages(data[0].messages || []);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await conversationAPI.createConversation();
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
      toast.success('New conversation created');
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const selectConversation = async (conv) => {
    setCurrentConversation(conv);
    try {
      const fullConv = await conversationAPI.getConversation(conv.id);
      setMessages(fullConv.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await conversationAPI.deleteConversation(convId);
        setConversations(conversations.filter(c => c.id !== convId));
        if (currentConversation?.id === convId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const sendMessage = async () => {
    if (!userText.trim() && !webcamRef.current) return;
    if (!currentConversation) {
      await createNewConversation();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      if (userText.trim()) {
        formData.append('text', userText);
      }
      
      if (webcamRef.current && showWebcam) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const blob = await (await fetch(imageSrc)).blob();
          formData.append('image', blob, 'frame.jpg');
        }
      }
      
      formData.append('conversation_id', currentConversation.id);

      const response = await conversationAPI.predictEmotion(formData);
      
      // Add user message
      const userMessage = {
        id: Date.now(),
        content: userText || '[Image]',
        is_user_message: true,
        text_emotion: response.text_emotion,
        text_confidence: response.text_confidence,
        face_emotion: response.face_emotion,
        face_confidence: response.face_confidence,
        final_emotion: response.final_emotion,
        final_confidence: response.final_confidence,
        emotion_intensity: response.emotion_intensity,
        fusion_method: response.fusion_method,
        created_at: new Date().toISOString(),
      };

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        content: response.bot_response,
        is_user_message: false,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage, botMessage]);
      setUserText('');
      
      // Refresh conversations to update the list
      loadConversations();
      
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐'
    };
    return icons[emotion] || '🤔';
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      high: '#ff4757',
      medium: '#ffa502',
      low: '#2ed573',
      very_low: '#70a1ff'
    };
    return colors[intensity] || '#747d8c';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`professional-chat ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">🧠</div>
            {!sidebarCollapsed && <span className="brand-text">EmotiAI</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="user-section">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="username">{user?.username}</div>
                <div className="user-status">Online</div>
              </div>
            </div>

            <div className="controls-section">
              <button onClick={createNewConversation} className="new-chat-btn">
                <span className="btn-icon">➕</span>
                New Conversation
              </button>
              
              <div className="theme-controls">
                <button onClick={toggleTheme} className="theme-btn">
                  {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'}
                </button>
                <button 
                  onClick={() => setShowWebcam(!showWebcam)} 
                  className={`webcam-btn ${showWebcam ? 'active' : ''}`}
                >
                  📷 Camera {showWebcam ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            <div className="conversations-section">
              <h3>Conversations</h3>
              <div className="conversations-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="conv-content">
                      <div className="conv-title">{conv.title}</div>
                      <div className="conv-date">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={(e) => deleteConversation(conv.id, e)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion Statistics */}
            {Object.keys(emotionStats).length > 0 && (
              <div className="stats-section">
                <h3>Emotion Insights</h3>
                <div className="emotion-stats">
                  {Object.entries(emotionStats)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 3)
                    .map(([emotion, stats]) => (
                    <div key={emotion} className="stat-item">
                      <span className="stat-emotion">
                        {getEmotionIcon(emotion)} {emotion}
                      </span>
                      <div className="stat-details">
                        <span className="stat-count">{stats.count}x</span>
                        <span className="stat-confidence">
                          {(stats.avgConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-footer">
              <button onClick={logout} className="logout-btn">
                🚪 Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="chat-header">
          <div className="header-left">
            <h2>{currentConversation?.title || 'Emotion Recognition Chat'}</h2>
            <div className="header-subtitle">
              AI-powered emotional intelligence • Real-time analysis
            </div>
          </div>
          <div className="header-right">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>AI Ready</span>
            </div>
          </div>
        </div>

        <div className="chat-body">
          <div className="messages-area">
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h3>Welcome to EmotiAI</h3>
                  <p>I'm here to understand and respond to your emotions. Share your thoughts or show your face to get started!</p>
                  <div className="welcome-features">
                    <div className="feature">
                      <span className="feature-icon">🧠</span>
                      <span>Advanced AI emotion detection</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">📊</span>
                      <span>Emotion intensity analysis</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">💬</span>
                      <span>Context-aware responses</span>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`message ${message.is_user_message ? 'user' : 'bot'}`}>
                    <div className="message-avatar">
                      {message.is_user_message ? 
                        user?.username?.charAt(0).toUpperCase() : 
                        '🤖'
                      }
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">{formatTime(message.created_at)}</div>
                      </div>
                      
                      {message.is_user_message && message.final_emotion && (
                        <div className="emotion-analysis">
                          <div className="analysis-header">
                            <span className="analysis-icon">🧠</span>
                            <span>Emotion Analysis</span>
                          </div>
                          
                          <div className="emotion-grid">
                            {message.text_emotion && (
                              <div className="emotion-item">
                                <div className="emotion-label">Text</div>
                                <div className="emotion-value">
                                  {getEmotionIcon(message.text_emotion)} {message.text_emotion}
                                  <span className="confidence">{(message.text_confidence * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            )}
                            
                            {message.face_emotion && (
                              <div className="emotion-item">
                                <div className="emotion-label">Face</div>
                                <div className="emotion-value">
                                  {getEmotionIcon(message.face_emotion)} {message.face_emotion}
                                  <span className="confidence">{(message.face_confidence * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="final-emotion">
                            <div className="final-header">
                              <span className="final-icon">🎯</span>
                              <span>Final Result</span>
                            </div>
                            <div className="final-content">
                              <div className="final-emotion-display">
                                {getEmotionIcon(message.final_emotion)} 
                                <span className="emotion-name">{message.final_emotion}</span>
                                <span className="final-confidence">
                                  {(message.final_confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="emotion-meta">
                                <div className="intensity-badge" style={{backgroundColor: getIntensityColor(message.emotion_intensity)}}>
                                  {message.emotion_intensity} intensity
                                </div>
                                <div className="fusion-method">
                                  {message.fusion_method?.replace(/_/g, ' ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <div className="input-container">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts or feelings..."
                  disabled={loading}
                  className="message-input"
                  rows="1"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={loading || (!userText.trim() && !showWebcam)} 
                  className="send-button"
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <span className="send-icon">📤</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Webcam Panel */}
          {showWebcam && (
            <div className="webcam-panel">
              <div className="webcam-header">
                <h3>📷 Live Camera</h3>
                <div className="webcam-status">
                  <div className="status-dot recording"></div>
                  <span>Recording</span>
                </div>
              </div>
              
              <div className="webcam-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height={200}
                  videoConstraints={{ facingMode: 'user' }}
                  className="webcam-feed"
                />
                <div className="webcam-overlay">
                  <div className="face-detection-frame"></div>
                </div>
              </div>
              
              <div className="webcam-info">
                <p>🎯 Face emotion detection active</p>
                <p>📊 Real-time analysis enabled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalChatInterface;