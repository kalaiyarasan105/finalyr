import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/auth';
import toast from 'react-hot-toast';
import './EmotionalInsights.css';

const EmotionalInsights = ({ onNavigateToChat }) => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(30);
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
    loadInsights();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/overview?days=${selectedTimeframe}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Please log in to view insights');
      } else if (error.response?.status === 404) {
        toast.error('Analytics service not available');
      } else {
        toast.error('Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await api.get('/analytics/insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Insights error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Don't show error toast for insights if analytics already showed auth error
        console.log('Authentication required for insights');
      } else {
        toast.error('Failed to load insights');
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
      <div className="insights-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your emotional patterns...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="insights-error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load insights</h3>
        <p>Please make sure you're logged in and have some conversation data</p>
        <button 
          onClick={() => {
            loadAnalytics();
            loadInsights();
          }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer'
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="emotional-insights">
      <div className="insights-header">
        <div className="header-content">
          <h1>Emotional Intelligence Insights</h1>
          <p>Deep analysis of your emotional patterns and behaviors</p>
        </div>
        
        <div className="timeframe-selector">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
            className="timeframe-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* AI Insights */}
      {insights && insights.insights && insights.insights.length > 0 ? (
        <div className="ai-insights-section">
          <h2>🤖 AI-Generated Insights</h2>
          <div className="insights-grid">
            {insights.insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-content">
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-data-section">
          <div className="no-data-card">
            <div className="no-data-icon">💬</div>
            <h3>Start Chatting to Generate Insights!</h3>
            <p>
              Once you have some conversations with the AI, you'll see personalized 
              insights about your emotional patterns and communication style here.
            </p>
            <button 
              onClick={() => onNavigateToChat && onNavigateToChat()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer'
              }}
            >
              💬 Start Your First Chat
            </button>
          </div>
        </div>
      )}

      <div className="insights-content">
        {/* Emotion Distribution */}
        <div className="insight-section">
          <h2>📊 Emotion Distribution</h2>
          <div className="emotion-chart">
            {Object.entries(analytics.emotion_distribution || {})
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([emotion, data]) => (
              <div key={emotion} className="emotion-bar">
                <div className="emotion-info">
                  <span className="emotion-label">
                    {getEmotionIcon(emotion)} {emotion}
                  </span>
                  <span className="emotion-stats">
                    {data.count} ({data.percentage}%)
                  </span>
                </div>
                <div className="emotion-progress">
                  <div 
                    className="emotion-fill"
                    style={{
                      width: `${data.percentage}%`,
                      backgroundColor: getEmotionColor(emotion)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Analysis */}
        <div className="insight-section">
          <h2>🎯 Detection Confidence</h2>
          <div className="confidence-analysis">
            <div className="confidence-overview">
              <div className="confidence-metric">
                <div className="metric-value">
                  {(analytics.confidence_analysis?.average * 100 || 0).toFixed(1)}%
                </div>
                <div className="metric-label">Average Confidence</div>
              </div>
              <div className="confidence-range">
                <div className="range-item">
                  <span>Min: {(analytics.confidence_analysis?.min * 100 || 0).toFixed(1)}%</span>
                </div>
                <div className="range-item">
                  <span>Max: {(analytics.confidence_analysis?.max * 100 || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="confidence-distribution">
              {Object.entries(analytics.confidence_analysis?.distribution || {}).map(([level, count]) => (
                <div key={level} className="confidence-level">
                  <div className="level-header">
                    <span className="level-name">{level}</span>
                    <span className="level-count">{count}</span>
                  </div>
                  <div className="level-bar">
                    <div 
                      className="level-fill"
                      style={{
                        width: `${(count / analytics.overview.total_messages) * 100}%`,
                        backgroundColor: level === 'high' ? '#10b981' : 
                                       level === 'medium' ? '#f59e0b' : 
                                       level === 'low' ? '#ef4444' : '#6b7280'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intensity Analysis */}
        <div className="insight-section">
          <h2>⚡ Emotion Intensity Patterns</h2>
          <div className="intensity-analysis">
            <div className="intensity-overview">
              {Object.entries(analytics.intensity_analysis?.overall_distribution || {}).map(([intensity, count]) => (
                <div key={intensity} className="intensity-card">
                  <div className="intensity-icon">
                    {intensity === 'high' ? '🔥' : 
                     intensity === 'medium' ? '⚡' : 
                     intensity === 'low' ? '💫' : '✨'}
                  </div>
                  <div className="intensity-info">
                    <div className="intensity-name">{intensity}</div>
                    <div className="intensity-count">{count} times</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fusion Method Stats */}
        <div className="insight-section">
          <h2>🔧 Detection Methods</h2>
          <div className="fusion-stats">
            {Object.entries(analytics.fusion_method_stats || {}).map(([method, data]) => (
              <div key={method} className="fusion-item">
                <div className="fusion-method">
                  <span className="method-name">{method.replace(/_/g, ' ')}</span>
                  <span className="method-percentage">{data.percentage}%</span>
                </div>
                <div className="method-description">
                  {method === 'text_only' && 'Text-based emotion detection'}
                  {method === 'face_only' && 'Facial expression analysis'}
                  {method === 'agreement_boost' && 'Both methods agreed'}
                  {method === 'text_dominant' && 'Text had higher confidence'}
                  {method === 'face_dominant' && 'Face had higher confidence'}
                  {method === 'weighted_text' && 'Text chosen in fusion'}
                  {method === 'weighted_face' && 'Face chosen in fusion'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional Journey */}
        {insights && insights.emotional_journey && (
          <div className="insight-section full-width">
            <h2>🌟 Recent Emotional Journey</h2>
            <div className="emotional-timeline">
              {insights.emotional_journey.slice(-10).map((point, index) => (
                <div key={index} className="timeline-point">
                  <div className="point-emotion">
                    <span className="emotion-icon">
                      {getEmotionIcon(point.emotion)}
                    </span>
                    <div className="emotion-details">
                      <div className="emotion-name">{point.emotion}</div>
                      <div className="emotion-meta">
                        {(point.confidence * 100).toFixed(0)}% • {point.intensity}
                      </div>
                    </div>
                  </div>
                  <div className="point-time">
                    {formatDate(point.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Patterns */}
        <div className="insight-section">
          <h2>💬 Conversation Patterns</h2>
          <div className="conversation-insights">
            <div className="pattern-grid">
              <div className="pattern-item">
                <div className="pattern-icon">📏</div>
                <div className="pattern-content">
                  <div className="pattern-value">
                    {analytics.conversation_patterns?.avg_length || 0}
                  </div>
                  <div className="pattern-label">Avg Messages per Chat</div>
                </div>
              </div>
              
              <div className="pattern-item">
                <div className="pattern-icon">📅</div>
                <div className="pattern-content">
                  <div className="pattern-value">
                    {analytics.conversation_patterns?.most_active_day || 'N/A'}
                  </div>
                  <div className="pattern-label">Most Active Day</div>
                </div>
              </div>
              
              <div className="pattern-item">
                <div className="pattern-icon">⚡</div>
                <div className="pattern-content">
                  <div className="pattern-value">
                    {(analytics.conversation_patterns?.conversation_frequency || 0).toFixed(1)}
                  </div>
                  <div className="pattern-label">Chats per Day</div>
                </div>
              </div>
            </div>
            
            <div className="length-distribution">
              <h4>Conversation Length Distribution</h4>
              <div className="distribution-bars">
                {Object.entries(analytics.conversation_patterns?.length_distribution || {}).map(([type, count]) => (
                  <div key={type} className="distribution-bar">
                    <div className="bar-label">{type}</div>
                    <div className="bar-visual">
                      <div 
                        className="bar-fill"
                        style={{
                          width: `${(count / analytics.overview.total_conversations) * 100}%`,
                          backgroundColor: type === 'short' ? '#ef4444' : 
                                         type === 'medium' ? '#f59e0b' : '#10b981'
                        }}
                      ></div>
                    </div>
                    <div className="bar-count">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsights;