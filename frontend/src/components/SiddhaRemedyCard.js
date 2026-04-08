import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const SiddhaRemedyCard = ({ remedy, onRequestNew }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (helpful) => {
    if (isSubmitting || feedback !== null) return; // Prevent multiple clicks
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('recommendation_id', remedy.id);
      formData.append('recommendation_type', 'siddha');
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
            onRequestNew('siddha');
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
          onRequestNew('siddha');
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse instructions if it's JSON
  const instructions = typeof remedy.instructions === 'string' 
    ? JSON.parse(remedy.instructions) 
    : remedy.instructions || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌿</span>
            <h3 className="text-xl font-semibold text-gray-800">
              {remedy.title}
            </h3>
          </div>
          {remedy.category && (
            <p className="text-sm text-gray-600 italic mb-2">
              {remedy.category}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.div>
        </button>
      </div>

      {remedy.tamil_context && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {remedy.tamil_context}
          </p>
        </div>
      )}

      {remedy.duration && (
        <div className="text-sm text-gray-600 mb-2">
          ⏱️ Duration: {remedy.duration}
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t pt-4 mt-4">
              {instructions.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-800 mb-2">How to do it:</h4>
                  <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
                    {instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </>
              )}
              
              {remedy.benefits && (
                <>
                  <h4 className="font-semibold text-gray-800 mb-2">Benefits:</h4>
                  <p className="text-gray-700 mb-4">{remedy.benefits}</p>
                </>
              )}

              {remedy.best_time && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Best Time:</strong> {remedy.best_time}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <AnimatePresence mode="wait">
          {feedback === null ? (
            <motion.div
              key="feedback-buttons"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm text-gray-500">Was this helpful?</span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFeedback(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  👍 Yes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleFeedback(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SiddhaRemedyCard;
