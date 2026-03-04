import React, { useState, useEffect, useCallback } from 'react';

const WellnessRecommendations = ({ currentEmotion, emotionIntensity }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRec, setExpandedRec] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!currentEmotion) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/wellness/recommendations/personalized?emotion=${currentEmotion}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch wellness recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentEmotion]);

  useEffect(() => {
    if (currentEmotion && currentEmotion !== 'neutral') {
      fetchRecommendations();
    }
  }, [currentEmotion, emotionIntensity, fetchRecommendations]);

  const submitFeedback = async (recommendationId, feedback) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/wellness/recommendations/${recommendationId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
      });
      
      if (response.ok) {
        // Update the recommendation to show feedback was submitted
        setRecommendations(prev => prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, feedbackSubmitted: true }
            : rec
        ));
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getTimeframeIcon = (timeframe) => {
    const icons = {
      immediate: '⚡',
      short_term: '🎯',
      long_term: '🌱'
    };
    return icons[timeframe] || '💡';
  };

  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'immediate':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'short_term':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'long_term':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!currentEmotion || currentEmotion === 'neutral') {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Wellness Recommendations
        </h3>
        <div className="space-y-4">
          {/* General Wellness Tips */}
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌟</span>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300">General Wellness Tips</h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="mt-1">💧</span>
                <span>Stay hydrated - drink at least 8 glasses of water daily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">🚶</span>
                <span>Take short walks - even 10 minutes can boost your mood</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">😴</span>
                <span>Maintain a regular sleep schedule for better emotional balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">🧘</span>
                <span>Practice mindfulness - be present in the moment</span>
              </li>
            </ul>
          </div>

          {/* Breathing Exercise */}
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌬️</span>
              <h4 className="font-semibold text-green-900 dark:text-green-300">Quick Breathing Exercise</h4>
            </div>
            <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
              <p className="font-medium">4-7-8 Breathing Technique:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Breathe in through your nose for 4 counts</li>
                <li>Hold your breath for 7 counts</li>
                <li>Exhale slowly through your mouth for 8 counts</li>
                <li>Repeat 3-4 times</li>
              </ol>
              <p className="text-xs italic mt-2">This helps calm your nervous system and reduce stress</p>
            </div>
          </div>

          {/* Grounding Technique */}
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧭</span>
              <h4 className="font-semibold text-purple-900 dark:text-purple-300">5-4-3-2-1 Grounding Technique</h4>
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
              <p>When feeling overwhelmed, notice:</p>
              <ul className="space-y-1 ml-2 mt-2">
                <li>👁️ <strong>5 things</strong> you can see</li>
                <li>✋ <strong>4 things</strong> you can touch</li>
                <li>👂 <strong>3 things</strong> you can hear</li>
                <li>👃 <strong>2 things</strong> you can smell</li>
                <li>👅 <strong>1 thing</strong> you can taste</li>
              </ul>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 text-center">
            <p className="text-lg font-medium text-yellow-900 dark:text-yellow-300 mb-2">
              "Every small step towards wellness counts"
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Start a conversation to get personalized recommendations based on your emotions
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => window.location.hash = '#chat'}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            💬 Start New Chat
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Wellness Recommendations
        </h3>
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Generating personalized recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💡 Wellness Recommendations
      </h3>
      
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div 
              key={rec.id || index} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTimeframeIcon(rec.timeframe)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeframeColor(rec.timeframe)}`}>
                    {rec.timeframe?.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                    {rec.confidence} confidence
                  </span>
                </div>
                {rec.personalized && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                    Personalized
                  </span>
                )}
              </div>
              
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {rec.action}
              </h4>
              
              {rec.duration && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  ⏱️ Duration: {rec.duration}
                </p>
              )}
              
              {rec.rationale && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {rec.rationale}
                </p>
              )}
              
              {rec.instructions && expandedRec === rec.id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                  <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Instructions:</h5>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {rec.instructions}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {rec.instructions && (
                    <button
                      onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {expandedRec === rec.id ? 'Hide' : 'Show'} Instructions
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => submitFeedback(rec.id, { completed: true, rating: 5 })}
                    className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    disabled={rec.feedbackSubmitted}
                  >
                    {rec.feedbackSubmitted ? '✓ Done' : 'Mark as Done'}
                  </button>
                  <button
                    onClick={() => submitFeedback(rec.id, { completed: false, rating: 2 })}
                    className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-colors"
                    disabled={rec.feedbackSubmitted}
                  >
                    Not Helpful
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {recommendations.length > 3 && (
            <button className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              View All {recommendations.length} Recommendations
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🤔</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No specific recommendations available right now
            </p>
          </div>

          {/* Fallback General Tips */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">💡 General Wellness Tips</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span>🌅</span>
                <span>Start your day with a positive affirmation</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🍎</span>
                <span>Eat nutritious meals at regular intervals</span>
              </div>
              <div className="flex items-start gap-2">
                <span>📱</span>
                <span>Take breaks from screens every hour</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🤝</span>
                <span>Connect with friends or family today</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.hash = '#chat'}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Start a Conversation for Personalized Tips
          </button>
        </div>
      )}
    </div>
  );
};

export default WellnessRecommendations;