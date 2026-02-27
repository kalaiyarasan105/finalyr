import React, { useState, useEffect, useCallback } from 'react';

const WellnessRecommendations = ({ currentEmotion, emotionIntensity }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRec, setExpandedRec] = useState(null);

  useEffect(() => {
    if (currentEmotion && currentEmotion !== 'neutral') {
      fetchRecommendations();
    }
  }, [currentEmotion, emotionIntensity, fetchRecommendations]);

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
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">😌</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Share your feelings to get personalized wellness recommendations
          </p>
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
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🤔</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No recommendations available for this emotion right now
          </p>
        </div>
      )}
    </div>
  );
};

export default WellnessRecommendations;