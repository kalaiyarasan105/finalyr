import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TamilIdiomCard = ({ idiom, onRequestNew }) => {
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (helpful) => {
    if (isSubmitting || feedback !== null) return; // Prevent multiple clicks
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('recommendation_id', idiom.id);
      formData.append('recommendation_type', 'idiom');
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
            onRequestNew('idioms');
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
          onRequestNew('idioms');
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-lg p-6 border-l-4 border-orange-500"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">📖</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {idiom.tamil_text}
          </h3>
          {idiom.transliteration && (
            <p className="text-sm text-gray-600 italic mb-2">
              {idiom.transliteration}
            </p>
          )}
          {idiom.english_translation && (
            <p className="text-sm text-gray-600 italic mb-3">
              "{idiom.english_translation}"
            </p>
          )}
        </div>
      </div>

      {idiom.context && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Context:</h4>
          <p className="text-gray-700 leading-relaxed">
            {idiom.context}
          </p>
        </div>
      )}

      {idiom.usage_example && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Example:</h4>
          <p className="text-gray-700 leading-relaxed">
            {idiom.usage_example}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-orange-200">
        <AnimatePresence mode="wait">
          {feedback === null ? (
            <motion.div
              key="feedback-buttons"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm text-gray-600">Did this resonate with you?</span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFeedback(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg transition-colors bg-white text-gray-700 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default TamilIdiomCard;
