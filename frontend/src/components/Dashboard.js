import React, { useState, useEffect } from 'react';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import WellnessRecommendations from './WellnessRecommendations';
import MoodInsights from './MoodInsights';

const Dashboard = ({ onNavigateToChat }) => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    emotionBreakdown: {},
    recentActivity: [],
    emotionTrends: [],
    averageConfidence: 0,
    mostFrequentEmotion: null,
    conversationLengths: [],
    currentEmotion: null,
    currentEmotionIntensity: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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

    // Get current emotion from most recent activity
    const currentEmotion = recentActivity.length > 0 ? recentActivity[0].emotion : null;
    const currentEmotionIntensity = recentActivity.length > 0 ? recentActivity[0].intensity : null;

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
      conversationLengths,
      currentEmotion,
      currentEmotionIntensity
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
      depression: '😞',
      anger: '😠',
      anxiety: '😰',
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
      depression: '#1e40af',
      anger: '#ef4444',
      anxiety: '#f59e0b',
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your emotional insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's your emotional intelligence dashboard</p>
        </div>
        <button 
          onClick={onNavigateToChat}
          className="btn-primary flex items-center gap-2 hover:scale-105 transform transition-all duration-200"
        >
          Start New Chat
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('wellness')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'wellness'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          💡 Wellness
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🧠 Mood Insights
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-hover">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalConversations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conversations</div>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalMessages}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages</div>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats.averageConfidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4">
                  <div className="text-2xl">
                    {stats.mostFrequentEmotion ? getEmotionIcon(stats.mostFrequentEmotion) : '😐'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.mostFrequentEmotion || 'None'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Top Emotion</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emotion Breakdown */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Emotion Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.emotionBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([emotion, count]) => {
                    const percentage = (count / Object.values(stats.emotionBreakdown).reduce((a, b) => a + b, 0)) * 100;
                    return (
                      <div key={emotion} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getEmotionIcon(emotion)}</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {emotion}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-1 ml-4">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: getEmotionColor(emotion)
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Emotional Activity
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getEmotionIcon(activity.emotion)}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white capitalize">
                            {activity.emotion}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {(activity.confidence * 100).toFixed(0)}% confidence • {activity.intensity} intensity
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.conversationTitle}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No emotional data yet. Start a conversation to see your insights!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Emotion Trends */}
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7-Day Emotion Trends
              </h2>
              <div className="flex justify-between items-end h-32 gap-2">
                {stats.emotionTrends.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-t h-20 flex flex-col justify-end">
                      {day.total > 0 ? (
                        <div className="flex flex-col h-full justify-end">
                          {Object.entries(day.emotions).map(([emotion, count], i) => (
                            <div
                              key={emotion}
                              className="transition-all duration-500 hover:opacity-80"
                              style={{
                                height: `${(count / day.total) * 100}%`,
                                backgroundColor: getEmotionColor(emotion)
                              }}
                              title={`${emotion}: ${count}`}
                            ></div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-1 bg-gray-300 dark:bg-gray-600"></div>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                      {day.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Emotional Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg mb-2"></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Conversation Patterns
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your conversations average {' '}
                    {stats.conversationLengths.length > 0 
                      ? Math.round(stats.conversationLengths.reduce((a, b) => a + b, 0) / stats.conversationLengths.length)
                      : 0
                    } messages each.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-full mb-2"></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Detection Accuracy
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your emotion detection confidence is {(stats.averageConfidence * 100).toFixed(0)}%, 
                    indicating {stats.averageConfidence > 0.8 ? 'excellent' : stats.averageConfidence > 0.6 ? 'good' : 'moderate'} accuracy.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 rounded mb-2"></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Emotional Diversity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've expressed {Object.keys(stats.emotionBreakdown).length} different emotions, 
                    showing a {Object.keys(stats.emotionBreakdown).length > 4 ? 'rich' : 'moderate'} emotional range.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'wellness' && (
        <WellnessRecommendations 
          currentEmotion={stats.currentEmotion}
          emotionIntensity={stats.currentEmotionIntensity}
        />
      )}

      {activeTab === 'insights' && (
        <MoodInsights />
      )}
    </div>
  );
};

export default Dashboard;