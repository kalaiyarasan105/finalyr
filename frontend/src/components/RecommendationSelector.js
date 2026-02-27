import React from 'react';
import { motion } from 'framer-motion';
import useRecommendationStore from '../store/recommendationStore';

const RecommendationSelector = ({ onSelectCategory }) => {
  const { currentEmotion } = useRecommendationStore();

  const categories = [
    {
      id: 'siddha',
      name: 'Siddha Remedies',
      description: 'Traditional Tamil medicine for body balance',
      icon: '🌿',
      color: 'bg-green-100 hover:bg-green-200'
    },
    {
      id: 'idioms',
      name: 'Tamil Wisdom',
      description: 'Chennai idioms and proverbs',
      icon: '📖',
      color: 'bg-orange-100 hover:bg-orange-200'
    },
    {
      id: 'quotes',
      name: 'Motivational Quotes',
      description: 'Thirukkural, Bharathiyar & more',
      icon: '✨',
      color: 'bg-purple-100 hover:bg-purple-200'
    },
    {
      id: 'music',
      name: 'Music Therapy',
      description: 'Carnatic ragas & devotional songs',
      icon: '🎵',
      color: 'bg-blue-100 hover:bg-blue-200'
    },
    {
      id: 'all',
      name: 'All Recommendations',
      description: 'Get everything to feel better',
      icon: '🌟',
      color: 'bg-gradient-to-r from-pink-100 to-yellow-100 hover:from-pink-200 hover:to-yellow-200'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          How can we help you feel better?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose a recommendation type to enhance your {currentEmotion || 'mood'}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            variants={cardVariants}
            whileHover="hover"
            onClick={() => onSelectCategory(category.id)}
            className={`${category.color} rounded-lg p-6 text-left shadow-md transition-all duration-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600`}
          >
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-2">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-700">
              {category.description}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default RecommendationSelector;
