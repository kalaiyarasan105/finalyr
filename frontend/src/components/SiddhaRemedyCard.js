import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const SiddhaRemedyCard = ({ remedy }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = async (helpful) => {
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
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show feedback visually even if API fails
      setFeedback(helpful);
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
        <span className="text-sm text-gray-500">Was this helpful?</span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              feedback === true
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
            }`}
          >
            👍 Yes
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              feedback === false
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
            }`}
          >
            👎 No
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SiddhaRemedyCard;
