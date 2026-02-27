import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotivationalQuoteCard = ({ quote }) => {
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = async (helpful) => {
    try {
      const formData = new FormData();
      formData.append('recommendation_id', quote.id);
      formData.append('recommendation_type', 'quote');
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-l-4 border-purple-500"
    >
      <div className="text-center mb-6">
        <span className="text-4xl mb-4 block">✨</span>
        {quote.english_translation && (
          <blockquote className="text-xl font-serif text-gray-800 mb-4 leading-relaxed">
            "{quote.english_translation}"
          </blockquote>
        )}
        {quote.tamil_text && (
          <p className="text-lg text-gray-600 italic mb-4">
            {quote.tamil_text}
          </p>
        )}
        {quote.transliteration && (
          <p className="text-sm text-gray-500 mb-4">
            {quote.transliteration}
          </p>
        )}
        {quote.author && (
          <p className="text-sm font-semibold text-purple-700">
            — {quote.author}
          </p>
        )}
        {quote.source && (
          <p className="text-xs text-gray-500 mt-1">
            {quote.source}
          </p>
        )}
      </div>

      {quote.context && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {quote.context}
          </p>
        </div>
      )}

      {quote.reflection_prompt && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Reflect:</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {quote.reflection_prompt}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-200">
        <span className="text-sm text-gray-600">Did this inspire you?</span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              feedback === true
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 hover:bg-purple-100'
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

export default MotivationalQuoteCard;
