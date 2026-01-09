import React, { useState, useEffect } from 'react';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = ({ onNavigateToChat }) => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    emotionBreakdown: {},
    recentActivity: [],
    emotionTrends: [],
    averageConfidence: 0,
    mostFrequentEmotion: null,
    conversationLengths: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const conversations = await conversationAPI.getConversations();
      
      // Calculate comprehensive statistics
      const dashboardStats = calculateStats(conversations);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (conversations) => {
    let totalMessages = 0;
    let emotionCounts = {};
    let confidenceSum = 0;
    let confidenceCount = 0;
    let recentActivity = [];
    let conversationLengths = [];

    conversations.forEach(conv => {
      const messages = conv.messages || [];
      const userMessages = messages.filter(m => m.is_user_message);
      
      conversationLengths.push(userMessages.length);
      totalMessages += messages.length;

      userMessages.forEach(msg => {
        if (msg.final_emotion) {
          emotionCounts[msg.final_emotion] = (emotionCounts[msg.final_emotion] || 0) + 1;
          
          if (msg.final_confidence) {
            confidenceSum += msg.final_confidence;
            confidenceCount++;
          }

          // Add to recent activity
          recentActivity.push({
            id: msg.id,
            emotion: msg.final_emotion,
            confidence: msg.final_confidence,
            intensity: msg.emotion_intensity,
            timestamp: msg.created_at,
            conversationTitle: conv.title
          });
        }
      });
    });

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    recentActivity = recentActivity.slice(0, 10); // Keep only last 10

    // Find most frequent emotion
    const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b, null
    );

    // Calculate emotion trends (last 7 days)
    const emotionTrends = calculateEmotionTrends(recentActivity);

    return {
      totalConversations: conversations.length,
      totalMessages,
      emotionBreakdown: emotionCounts,
      recentActivity,
      emotionTrends,
      averageConfidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
      mostFrequentEmotion,
      conversationLengths
    };
  };

  const calculateEmotionTrends = (activity) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivity = activity.filter(item => 
        item.timestamp.startsWith(dateStr)
      );
      
      const emotionCounts = {};
      dayActivity.forEach(item => {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
      });

      last7Days.push({
        date: dateStr,
        emotions: emotionCounts,
        total: dayActivity.length
      });
    }
    
    return last7Days;
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

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: '#10b981',
      sadness: '#3b82f6',
      anger: '#ef4444',
      fear: '#8b5cf6',
      surprise: '#f59e0b',
      disgust: '#84cc16',
      neutral: '#6b7280'
    };
    return colors[emotion] || '#6b7280';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your emotional insights...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p>Here's your emotional intelligence dashboard</p>
        </div>
        <button className="start-chat-btn" onClick={onNavigateToChat}>
          💬 Start New Chat
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalConversations}</div>
            <div className="metric-label">Conversations</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalMessages}</div>
            <div className="metric-label">Total Messages</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{(stats.averageConfidence * 100).toFixed(0)}%</div>
            <div className="metric-label">Avg Confidence</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            {stats.mostFrequentEmotion ? getEmotionIcon(stats.mostFrequentEmotion) : '😐'}
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {stats.mostFrequentEmotion || 'None'}
            </div>
            <div className="metric-label">Top Emotion</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Emotion Breakdown */}
        <div className="dashboard-section">
          <h2>Emotion Distribution</h2>
          <div className="emotion-breakdown">
            {Object.entries(stats.emotionBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([emotion, count]) => {
                const percentage = (count / Object.values(stats.emotionBreakdown).reduce((a, b) => a + b, 0)) * 100;
                return (
                  <div key={emotion} className="emotion-bar">
                    <div className="emotion-info">
                      <span className="emotion-label">
                        {getEmotionIcon(emotion)} {emotion}
                      </span>
                      <span className="emotion-count">{count}</span>
                    </div>
                    <div className="emotion-progress">
                      <div 
                        className="emotion-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getEmotionColor(emotion)
                        }}
                      ></div>
                    </div>
                    <span className="emotion-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>Recent Emotional Activity</h2>
          <div className="activity-list">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-emotion">
                    <span className="activity-icon">
                      {getEmotionIcon(activity.emotion)}
                    </span>
                    <div className="activity-details">
                      <div className="activity-emotion-name">{activity.emotion}</div>
                      <div className="activity-meta">
                        {(activity.confidence * 100).toFixed(0)}% confidence • {activity.intensity} intensity
                      </div>
                    </div>
                  </div>
                  <div className="activity-info">
                    <div className="activity-conversation">{activity.conversationTitle}</div>
                    <div className="activity-time">{formatDate(activity.timestamp)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <p>No emotional data yet. Start a conversation to see your insights!</p>
              </div>
            )}
          </div>
        </div>

        {/* Emotion Trends */}
        <div className="dashboard-section">
          <h2>7-Day Emotion Trends</h2>
          <div className="trends-chart">
            {stats.emotionTrends.map((day, index) => (
              <div key={index} className="trend-day">
                <div className="trend-date">
                  {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                </div>
                <div className="trend-bar">
                  <div className="trend-total">{day.total}</div>
                  {day.total > 0 && (
                    <div className="trend-emotions">
                      {Object.entries(day.emotions).map(([emotion, count]) => (
                        <div
                          key={emotion}
                          className="trend-emotion-segment"
                          style={{
                            height: `${(count / day.total) * 100}%`,
                            backgroundColor: getEmotionColor(emotion)
                          }}
                          title={`${emotion}: ${count}`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="dashboard-section">
          <h2>Emotional Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h3>Conversation Patterns</h3>
                <p>
                  Your conversations average {' '}
                  {stats.conversationLengths.length > 0 
                    ? Math.round(stats.conversationLengths.reduce((a, b) => a + b, 0) / stats.conversationLengths.length)
                    : 0
                  } messages each.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h3>Detection Accuracy</h3>
                <p>
                  Your emotion detection confidence is {(stats.averageConfidence * 100).toFixed(0)}%, 
                  indicating {stats.averageConfidence > 0.8 ? 'excellent' : stats.averageConfidence > 0.6 ? 'good' : 'moderate'} accuracy.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🌟</div>
              <div className="insight-content">
                <h3>Emotional Diversity</h3>
                <p>
                  You've expressed {Object.keys(stats.emotionBreakdown).length} different emotions, 
                  showing a {Object.keys(stats.emotionBreakdown).length > 4 ? 'rich' : 'moderate'} emotional range.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;