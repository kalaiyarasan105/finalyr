import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './Chat.css';

const SimpleChatInterface = () => {
  const webcamRef = useRef(null);
  const [userText, setUserText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      
      if (webcamRef.current) {
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

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <span>👤 {user?.username}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
        
        <div className="conversations-list">
          <button onClick={createNewConversation} className="new-chat-btn">
            ➕ New Chat
          </button>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <div className="conv-title">{conv.title}</div>
              <div className="conv-date">
                {new Date(conv.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="chat-header">
          <h2>{currentConversation?.title || 'Emotion Recognition Chat'}</h2>
        </div>

        <div className="chat-area">
          <div className="messages-panel">
            <div className="messages-container">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.is_user_message ? 'user' : 'bot'}`}>
                  <div className="message-icon">
                    {message.is_user_message ? '👤' : '🤖'}
                  </div>
                  <div className="message-bubble">
                    {message.content}
                    {message.is_user_message && (message.text_emotion || message.face_emotion) && (
                      <div className="emotion-info">
                        <div className="emotion-header">🧠 Emotion Analysis</div>
                        {message.text_emotion && (
                          <div className="emotion-detail">
                            📝 Text: <strong>{message.text_emotion}</strong> ({(message.text_confidence * 100).toFixed(1)}%)
                          </div>
                        )}
                        {message.face_emotion && (
                          <div className="emotion-detail">
                            😊 Face: <strong>{message.face_emotion}</strong> ({(message.face_confidence * 100).toFixed(1)}%)
                          </div>
                        )}
                        {message.final_emotion && (
                          <div className="emotion-final">
                            🎯 Final: <strong>{message.final_emotion}</strong> ({(message.final_confidence * 100).toFixed(1)}%)
                            <div className="emotion-meta">
                              <span className="intensity">Intensity: <strong>{message.emotion_intensity}</strong></span>
                              <span className="fusion">Method: <strong>{message.fusion_method?.replace('_', ' ')}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="input-panel">
              <div className="input-container">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="text-input"
                />
                <button onClick={sendMessage} disabled={loading} className="send-btn">
                  {loading ? '⏳' : '📤'}
                </button>
              </div>
            </div>
          </div>

          <div className="webcam-panel">
            <h3>📷 Camera Feed</h3>
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height={240}
                videoConstraints={{ facingMode: 'user' }}
              />
            </div>
            <p className="webcam-note">
              Your camera feed is used for emotion detection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatInterface;