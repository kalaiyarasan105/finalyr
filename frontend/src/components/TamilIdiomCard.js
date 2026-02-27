import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const TamilIdiomCard = ({ idiom }) => {
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = async (helpful) => {
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
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show feedback visually even if API fails
      setFeedback(helpful);
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
        <span className="text-sm text-gray-600">Did this resonate with you?</span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              feedback === true
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-orange-100'
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
                : 'bg-white text-gray-700 hover:bg-red-100'
            }`}
          >
            👎 No
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TamilIdiomCard;
