import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import WebcamCapture from './WebcamCapture';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import './ProfessionalChat.css';
import RecommendationSelector from './RecommendationSelector';
import RecommendationDisplay from './RecommendationDisplay';
import ColorTherapy from './ColorTherapy';
import useRecommendationStore from '../store/recommendationStore';

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
  
  // Recommendation system state
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationView, setRecommendationView] = useState('selector'); // 'selector' or 'display'
  const [recommendationMessageId, setRecommendationMessageId] = useState(null); // Track which message shows recommendations
  const { 
    setCurrentEmotion, 
    setSelectedCategory, 
    setColorTheme, 
    resetRecommendations 
  } = useRecommendationStore();

  useEffect(() => {
    loadConversations();
    // Load theme preference and apply to entire app
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when recommendations are shown
    if (showRecommendations) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [showRecommendations, recommendationView]);

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
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply to both body (for chat) and documentElement (for entire app)
    document.body.classList.toggle('dark-theme', newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
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

  // Handle webcam capture
  const handleWebcamCapture = (imageSrc) => {
    console.log('Webcam captured image:', imageSrc ? 'Success' : 'Failed');
    if (imageSrc) {
      toast.success('📸 Image captured successfully!');
    }
  };

  // Test webcam capture
  const testWebcamCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        console.log('Test capture successful');
        toast.success('📸 Test capture successful!');
        handleWebcamCapture(imageSrc);
      } else {
        console.log('Test capture failed');
        toast.error('❌ Test capture failed');
      }
    } else {
      console.log('Webcam ref not available');
      toast.error('❌ Webcam not available');
    }
  };

  const sendMessage = async () => {
    if (!userText.trim() && !showWebcam) return;
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
      
      // Get webcam image if camera is active
      let imageSrc = null;
      if (webcamRef.current && showWebcam) {
        // Use the WebcamCapture component's getScreenshot method
        imageSrc = webcamRef.current.getScreenshot();
        
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
      
      // Trigger recommendations for negative emotions
      const negativeEmotions = ['sadness', 'sad', 'anger', 'angry', 'fear', 'fearful', 'disgust', 'disgusted'];
      const detectedEmotion = response.final_emotion.toLowerCase().trim();
      
      console.log('=== RECOMMENDATION TRIGGER CHECK ===');
      console.log('Detected emotion:', detectedEmotion);
      console.log('Bot message ID:', botMessage.id);
      console.log('Should trigger recommendations:', negativeEmotions.includes(detectedEmotion));
      
      if (negativeEmotions.includes(detectedEmotion)) {
        // Set which message should show recommendations (the bot's reply)
        console.log('Setting recommendation message ID to:', botMessage.id);
        setRecommendationMessageId(botMessage.id);
        
        // Trigger recommendations immediately
        await triggerRecommendations(detectedEmotion);
        console.log('Recommendations triggered, showRecommendations should be true');
      }
      
      // Refresh conversations to update the list
      loadConversations();
      
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerRecommendations = async (emotion) => {
    let emotionLower = emotion.toLowerCase().trim();
    
    // Normalize emotion names for API
    const emotionMap = {
      'sad': 'sadness',
      'angry': 'anger',
      'fearful': 'fear',
      'disgusted': 'disgust'
    };
    
    // Use mapped emotion if available, otherwise use original
    const apiEmotion = emotionMap[emotionLower] || emotionLower;
    
    console.log('triggerRecommendations called with emotion:', emotionLower, '-> API emotion:', apiEmotion);
    try {
      // Set current emotion in store
      setCurrentEmotion(apiEmotion);
      
      // Fetch color theme for this emotion
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/recommendations/color-theme/${apiEmotion}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Color theme response:', response.data);
      
      if (response.data.color_theme) {
        setColorTheme(response.data.color_theme);
      } else if (response.data) {
        // API returns theme directly, not wrapped
        setColorTheme(response.data);
      }
      
      // Show recommendation selector inline (not modal)
      setShowRecommendations(true);
      setRecommendationView('selector');
      
      console.log('Inline recommendations should now be visible');
      console.log('showRecommendations:', true, 'recommendationView:', 'selector');
      
      // Scroll to bottom to show recommendations
      setTimeout(() => scrollToBottom(), 200);
      
      toast.success(`💡 We have recommendations to help with ${apiEmotion}!`);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setRecommendationView('display');
    // Scroll to show the recommendations
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleBackToSelector = () => {
    setRecommendationView('selector');
    resetRecommendations();
  };

  const handleCloseRecommendations = () => {
    setShowRecommendations(false);
    setRecommendationView('selector');
    setRecommendationMessageId(null);
    resetRecommendations();
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
    <ColorTherapy>
      <div className={`professional-chat ${darkMode ? 'dark' : 'light'}`}>
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
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
            <div className="header-controls">
              <button 
                onClick={createNewConversation} 
                className="header-btn primary"
                title="New Conversation"
              >
                ➕ New Conversation
              </button>
              
              <button 
                onClick={toggleTheme} 
                className="header-btn secondary"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              
              <button 
                onClick={() => setShowWebcam(!showWebcam)} 
                className={`header-btn ${showWebcam ? 'success' : 'inactive'}`}
                title={showWebcam ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                📷 Camera {showWebcam ? 'On' : 'Off'}
              </button>
            </div>
            
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
                  <React.Fragment key={message.id}>
                    <div className={`message ${message.is_user_message ? 'user' : 'bot'}`}>
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
                    
                    {/* Show recommendations inline after bot message if this is the recommendation message */}
                    {!message.is_user_message && message.id === recommendationMessageId && showRecommendations && (
                      <div className="inline-recommendations">
                        <div className="recommendation-header">
                          <h3>💡 Recommendations to Help You Feel Better</h3>
                          <button 
                            className="close-recommendations-btn"
                            onClick={handleCloseRecommendations}
                            title="Close recommendations"
                          >
                            ✕
                          </button>
                        </div>
                        {recommendationView === 'selector' ? (
                          <RecommendationSelector onSelectCategory={handleSelectCategory} />
                        ) : (
                          <RecommendationDisplay onBack={handleBackToSelector} />
                        )}
                      </div>
                    )}
                    {/* Debug info - remove after testing */}
                    {!message.is_user_message && (
                      <div style={{ display: 'none' }}>
                        Message ID: {message.id}, 
                        Recommendation ID: {recommendationMessageId}, 
                        Show: {showRecommendations ? 'yes' : 'no'},
                        Match: {message.id === recommendationMessageId ? 'yes' : 'no'}
                      </div>
                    )}
                  </React.Fragment>
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
              
              <WebcamCapture
                ref={webcamRef}
                onCapture={handleWebcamCapture}
                isActive={showWebcam}
                width={320}
                height={200}
                className="professional-webcam"
                showControls={true}
              />
              
              <div className="webcam-info">
                <p>🎯 Face emotion detection active</p>
                <p>📊 Real-time analysis enabled</p>
                <button 
                  onClick={testWebcamCapture}
                  className="test-capture-btn"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  📸 Test Capture
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </ColorTherapy>
  );
};

export default ProfessionalChatInterface;