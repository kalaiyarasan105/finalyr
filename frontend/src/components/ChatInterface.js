import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import WellnessRecommendations from './WellnessRecommendations';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { Camera, Send, MessageCircle, User, Bot, Image as ImageIcon, Heart } from 'lucide-react';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f7fa;
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #333;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const ConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const ConversationItem = styled.div`
  padding: 15px;
  margin-bottom: 5px;
  border-radius: 10px;
  cursor: pointer;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  
  &:hover {
    background: ${props => props.active ? '#667eea' : '#f0f0f0'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const NewChatButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
`;

const MessagesPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  ${props => props.isUser && 'flex-direction: row-reverse;'}
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 15px 20px;
  border-radius: 20px;
  background: ${props => props.isUser ? '#667eea' : '#f0f0f0'};
  color: ${props => props.isUser ? 'white' : '#333'};
  word-wrap: break-word;
`;

const MessageIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isUser ? '#667eea' : '#e1e5e9'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.isUser ? 'white' : '#666'};
  flex-shrink: 0;
`;

const EmotionInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 0.9em;
`;

const InputPanel = styled.div`
  padding: 20px;
  border-top: 1px solid #e1e5e9;
  background: white;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const TextInput = styled.textarea`
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  font-family: inherit;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ActionButton = styled.button`
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WebcamPanel = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RightPanel = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WellnessPanel = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const WebcamContainer = styled.div`
  border-radius: 15px;
  overflow: hidden;
  background: #f0f0f0;
`;

const ChatInterface = () => {
  const webcamRef = useRef(null);
  const [userText, setUserText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [currentEmotionIntensity, setCurrentEmotionIntensity] = useState(null);
  const [wellnessRecommendations, setWellnessRecommendations] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

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
      
      // Update current emotion state for wellness recommendations
      if (response.final_emotion && response.final_emotion !== 'neutral') {
        setCurrentEmotion(response.final_emotion);
        setCurrentEmotionIntensity(response.emotion_intensity);
        
        // Set wellness recommendations if they exist in the response
        if (response.wellness_recommendations) {
          setWellnessRecommendations(response.wellness_recommendations);
        }
      }
      
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
    <Container>
      <Sidebar>
        <SidebarHeader>
          <UserInfo>
            <User size={20} />
            {user?.username}
          </UserInfo>
          <LogoutButton onClick={logout}>
            Logout
          </LogoutButton>
        </SidebarHeader>
        
        <ConversationsList>
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              active={currentConversation?.id === conv.id}
              onClick={() => selectConversation(conv)}
            >
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                {conv.title}
              </div>
              <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
                {new Date(conv.created_at).toLocaleDateString()}
              </div>
            </ConversationItem>
          ))}
        </ConversationsList>
      </Sidebar>

      <MainContent>
        <ChatHeader>
          <ChatTitle>
            {currentConversation?.title || 'Emotion Recognition Chat'}
          </ChatTitle>
          <NewChatButton onClick={createNewConversation}>
            <MessageCircle size={20} />
            New Chat
          </NewChatButton>
        </ChatHeader>

        <ChatArea>
          <MessagesPanel>
            <MessagesContainer>
              {messages.map((message) => (
                <Message key={message.id} isUser={message.is_user_message}>
                  <MessageIcon isUser={message.is_user_message}>
                    {message.is_user_message ? <User size={20} /> : <Bot size={20} />}
                  </MessageIcon>
                  <MessageBubble isUser={message.is_user_message}>
                    {message.content}
                    {message.is_user_message && (message.final_emotion || message.text_emotion || message.face_emotion) && (
                      <EmotionInfo>
                        {message.final_emotion && (
                          <div><strong>Final:</strong> {message.final_emotion} ({(message.final_confidence * 100).toFixed(1)}%) - {message.emotion_intensity}</div>
                        )}
                        {message.text_emotion && (
                          <div>Text: {message.text_emotion} ({(message.text_confidence * 100).toFixed(1)}%)</div>
                        )}
                        {message.face_emotion && (
                          <div>Face: {message.face_emotion} ({(message.face_confidence * 100).toFixed(1)}%)</div>
                        )}
                      </EmotionInfo>
                    )}
                  </MessageBubble>
                </Message>
              ))}
            </MessagesContainer>

            <InputPanel>
              <InputContainer>
                <TextInput
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <ActionButton onClick={sendMessage} disabled={loading}>
                  <Send size={20} />
                </ActionButton>
              </InputContainer>
            </InputPanel>
          </MessagesPanel>

          <RightPanel>
            <WellnessPanel>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} />
                Wellness Recommendations
              </h3>
              <WellnessRecommendations 
                currentEmotion={currentEmotion}
                emotionIntensity={currentEmotionIntensity}
              />
            </WellnessPanel>
            
            <WebcamPanel>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                <Camera size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Camera Feed
              </h3>
              <WebcamContainer>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height={240}
                  videoConstraints={{ facingMode: 'user' }}
                />
              </WebcamContainer>
              <p style={{ margin: 0, fontSize: '0.9em', color: '#666', textAlign: 'center' }}>
                Your camera feed is used for emotion detection
              </p>
            </WebcamPanel>
          </RightPanel>
        </ChatArea>
      </MainContent>
    </Container>
  );
};

export default ChatInterface;