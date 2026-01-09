import React, { useState, useEffect } from 'react';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './ConversationHistory.css';

const ConversationHistory = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationAPI.getConversations();
      
      // Enrich conversations with emotion data
      const enrichedConversations = data.map(conv => {
        const userMessages = (conv.messages || []).filter(m => m.is_user_message);
        const emotions = userMessages
          .filter(m => m.final_emotion)
          .map(m => m.final_emotion);
        
        const emotionCounts = {};
        emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });

        const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b, null
        );

        const avgConfidence = userMessages
          .filter(m => m.final_confidence)
          .reduce((sum, m, _, arr) => sum + m.final_confidence / arr.length, 0);

        return {
          ...conv,
          messageCount: conv.messages?.length || 0,
          userMessageCount: userMessages.length,
          dominantEmotion,
          emotionCounts,
          avgConfidence,
          lastActivity: conv.messages?.length > 0 ? 
            conv.messages[conv.messages.length - 1].created_at : 
            conv.created_at
        };
      });

      setConversations(enrichedConversations);
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (convId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await conversationAPI.deleteConversation(convId);
        setConversations(conversations.filter(c => c.id !== convId));
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredAndSortedConversations = conversations
    .filter(conv => {
      const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.messages || []).some(m => 
          m.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesEmotion = filterEmotion === 'all' || 
        conv.dominantEmotion === filterEmotion;

      return matchesSearch && matchesEmotion;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        case 'messages':
          return b.messageCount - a.messageCount;
        case 'emotion':
          return (a.dominantEmotion || '').localeCompare(b.dominantEmotion || '');
        default:
          return 0;
      }
    });

  const uniqueEmotions = [...new Set(conversations
    .map(c => c.dominantEmotion)
    .filter(Boolean)
  )];

  if (loading) {
    return (
      <div className="history-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversation history...</p>
      </div>
    );
  }

  return (
    <div className="conversation-history">
      <div className="history-header">
        <div className="header-content">
          <h1>Conversation History</h1>
          <p>Browse and analyze your past conversations</p>
        </div>
        
        <div className="history-stats">
          <div className="stat">
            <span className="stat-value">{conversations.length}</span>
            <span className="stat-label">Total Conversations</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {conversations.reduce((sum, c) => sum + c.messageCount, 0)}
            </span>
            <span className="stat-label">Total Messages</span>
          </div>
        </div>
      </div>

      <div className="history-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Emotions</option>
            {uniqueEmotions.map(emotion => (
              <option key={emotion} value={emotion}>
                {getEmotionIcon(emotion)} {emotion}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="messages">Sort by Messages</option>
            <option value="emotion">Sort by Emotion</option>
          </select>
        </div>
      </div>

      <div className="conversations-grid">
        {filteredAndSortedConversations.length > 0 ? (
          filteredAndSortedConversations.map((conv) => (
            <div key={conv.id} className="conversation-card">
              <div className="card-header">
                <div className="conv-title">{conv.title}</div>
                <div className="card-actions">
                  <button
                    className="view-btn"
                    onClick={() => onSelectConversation(conv)}
                    title="View Conversation"
                  >
                    👁️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteConversation(conv.id)}
                    title="Delete Conversation"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="conv-stats">
                  <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <span>{conv.messageCount} messages</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <span>{formatDate(conv.lastActivity)}</span>
                  </div>
                  {conv.avgConfidence > 0 && (
                    <div className="stat-item">
                      <span className="stat-icon">🎯</span>
                      <span>{(conv.avgConfidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  )}
                </div>

                {conv.dominantEmotion && (
                  <div className="emotion-summary">
                    <div className="dominant-emotion">
                      <span className="emotion-icon">
                        {getEmotionIcon(conv.dominantEmotion)}
                      </span>
                      <span className="emotion-name">
                        Dominant: {conv.dominantEmotion}
                      </span>
                    </div>
                    
                    <div className="emotion-breakdown">
                      {Object.entries(conv.emotionCounts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([emotion, count]) => (
                        <div key={emotion} className="emotion-chip">
                          {getEmotionIcon(emotion)} {count}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {conv.messages && conv.messages.length > 0 && (
                  <div className="last-message">
                    <div className="message-preview">
                      {conv.messages[conv.messages.length - 1].content.substring(0, 100)}
                      {conv.messages[conv.messages.length - 1].content.length > 100 && '...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No conversations found</h3>
            <p>
              {searchTerm || filterEmotion !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start a conversation to see your history here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;