import React, { useState, useEffect } from 'react';

const MoodInsights = () => {
  const [insights, setInsights] = useState(null);
  const [smartPrompts, setSmartPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchMoodInsights();
    fetchSmartPrompts();
  }, [timeRange]);

  const fetchMoodInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mood-journal/insights?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch mood insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartPrompts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mood-journal/smart-prompts?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSmartPrompts(data);
      }
    } catch (error) {
      console.error('Failed to fetch smart prompts:', error);
    }
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

  const getPromptTypeIcon = (type) => {
    const icons = {
      exploration: '🔍',
      positive_reinforcement: '🌟',
      social_connection: '👥',
      physical_wellness: '💪',
      reflection: '🤔',
      general: '💭'
    };
    return icons[type] || '💡';
  };

  const formatPercentage = (value) => {
    return (value * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing your mood patterns...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || insights.total_conversations === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Mood Insights
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Start conversations to see your mood insights and patterns
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📊 Mood Insights
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 2 weeks</option>
          <option value={30}>Last month</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {insights.total_conversations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Conversations</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {insights.wellness_progress?.recommendations_received || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wellness Tips</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {insights.trigger_analysis?.total_triggers || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Triggers Identified</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {insights.coping_effectiveness?.strategies_identified || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Coping Strategies</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Emotion Distribution
          </h3>
          {Object.keys(insights.emotion_distribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(insights.emotion_distribution)
                .sort(([,a], [,b]) => b - a)
                .map(([emotion, percentage]) => (
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
                          className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${formatPercentage(percentage)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                        {formatPercentage(percentage)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No emotion data available
            </p>
          )}
        </div>

        {/* Activity Correlations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity-Emotion Correlations
          </h3>
          {Object.keys(insights.activity_correlations).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(insights.activity_correlations).map(([activity, emotions]) => (
                <div key={activity} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                    {activity.replace('_', ' ')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotion, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No activity correlations found
            </p>
          )}
        </div>

        {/* Social Context */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Social Context
          </h3>
          {Object.keys(insights.social_context).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(insights.social_context)
                .filter(([, count]) => count > 0)
                .sort(([,a], [,b]) => b - a)
                .map(([context, count]) => (
                  <div key={context} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {context.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">
                      {count} mentions
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No social context data
            </p>
          )}
        </div>

        {/* Physical & Environmental Factors */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Physical & Environmental Factors
          </h3>
          <div className="space-y-4">
            {insights.physical_symptoms.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Physical Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.physical_symptoms.map((symptom, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {insights.environmental_factors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Environmental Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.environmental_factors.map((factor, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {insights.physical_symptoms.length === 0 && insights.environmental_factors.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No physical or environmental factors mentioned
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Smart Prompts */}
      {smartPrompts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💭 Personalized Reflection Prompts
          </h3>
          <div className="space-y-4">
            {smartPrompts.slice(0, 3).map((prompt, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getPromptTypeIcon(prompt.type)}</span>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                      {prompt.prompt}
                    </p>
                    {prompt.follow_up && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Follow-up: {prompt.follow_up}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
                        {prompt.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Progress */}
      {insights.wellness_progress && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🌱 Wellness Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {insights.wellness_progress.recommendations_received}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Recommendations Received
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {insights.wellness_progress.feedback_provided}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Feedback Provided
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {insights.wellness_progress.average_rating ? insights.wellness_progress.average_rating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodInsights;