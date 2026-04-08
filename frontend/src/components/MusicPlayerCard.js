import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const MusicPlayerCard = ({ track, onRequestNew }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const playerRef = useRef(null);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(track.youtube_link);

  const togglePlayer = () => {
    setShowPlayer(!showPlayer);
  };

  const handleFeedback = async (helpful) => {
    if (isSubmitting || feedback !== null) return; // Prevent multiple clicks
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('recommendation_id', track.id);
      formData.append('recommendation_type', 'music');
      formData.append('completed', 'true');
      formData.append('effectiveness_rating', helpful ? '5' : '2');
      
      const response = await axios.post('http://localhost:8000/api/recommendations/feedback', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        setFeedback(helpful);
        
        // If user said "No", request a new recommendation after a short delay
        if (!helpful && onRequestNew) {
          setTimeout(() => {
            onRequestNew('music');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show feedback visually even if API fails
      setFeedback(helpful);
      
      // If user said "No", request a new recommendation after a short delay
      if (!helpful && onRequestNew) {
        setTimeout(() => {
          onRequestNew('music');
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-l-4 border-blue-500"
    >
      <div className="flex items-start gap-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayer}
          className="flex-shrink-0 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
        >
          {showPlayer ? (
            <span className="text-2xl">⏸</span>
          ) : (
            <span className="text-2xl ml-1">▶</span>
          )}
        </motion.button>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {track.title}
          </h3>
          {track.artist && (
            <p className="text-sm text-gray-600 mb-2">
              {track.artist}
            </p>
          )}
          {track.raga && (
            <p className="text-xs text-blue-700 font-semibold">
              Raga: {track.raga}
            </p>
          )}
          {track.duration && (
            <p className="text-xs text-gray-500 mt-1">
              Duration: {track.duration}
            </p>
          )}
        </div>

        <span className="text-3xl">🎵</span>
      </div>

      {/* Audio-Only Player - YouTube with hidden video */}
      {showPlayer && youtubeId && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 shadow-inner border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">🎵 Now Playing</span>
              </div>
              {track.duration && (
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">{track.duration}</span>
              )}
            </div>
            
            {/* YouTube Audio Player - Video hidden, only controls visible */}
            <div className="bg-black rounded-lg overflow-hidden" style={{ height: '60px' }}>
              <iframe
                ref={playerRef}
                width="100%"
                height="60"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                title={track.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 'none', display: 'block' }}
              />
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Audio playing from YouTube
            </p>
          </div>
        </motion.div>
      )}

      {track.description && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">About this music:</h4>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            {track.description}
          </p>
          {track.benefits && (
            <p className="text-gray-600 text-sm">
              <strong>Benefits:</strong> {track.benefits}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
        <AnimatePresence mode="wait">
          {feedback === null ? (
            <motion.div
              key="feedback-buttons"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm text-gray-600">Did this help your mood?</span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFeedback(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg transition-colors bg-white text-gray-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  👍 Yes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFeedback(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg transition-colors bg-white text-gray-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  👎 No
                </motion.button>
              </div>
            </motion.div>
          ) : feedback === true ? (
            <motion.div
              key="feedback-success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 w-full bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-2xl"
              >
                👍
              </motion.span>
              <div className="flex-1">
                <p className="text-green-800 font-medium">Feedback received</p>
                <p className="text-green-600 text-sm">Thank you for helping improve our AI.</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-sm">✓</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback-negative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 w-full bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-2xl"
              >
                ⚡
              </motion.span>
              <div className="flex-1">
                <p className="text-blue-800 font-medium">Let's try something better</p>
                <p className="text-blue-600 text-sm">Loading a new recommendation for you...</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MusicPlayerCard;
