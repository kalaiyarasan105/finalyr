import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useRecommendationStore from '../store/recommendationStore';
import SiddhaRemedyCard from './SiddhaRemedyCard';
import TamilIdiomCard from './TamilIdiomCard';
import MotivationalQuoteCard from './MotivationalQuoteCard';
import MusicPlayerCard from './MusicPlayerCard';

const RecommendationDisplay = ({ onBack }) => {
  const {
    currentEmotion,
    selectedCategory,
    recommendations,
    setRecommendations,
    setLoading,
    isLoading
  } = useRecommendationStore();

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [currentEmotion, selectedCategory]);

  const fetchRecommendations = async () => {
    if (!currentEmotion || !selectedCategory) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      console.log('Fetching recommendations for:', currentEmotion, selectedCategory);

      if (selectedCategory === 'all') {
        // Fetch all categories
        const [siddha, idioms, quotes, music] = await Promise.all([
          axios.get(`http://localhost:8000/api/recommendations/${currentEmotion}/siddha`, { headers }).catch(e => ({ data: { recommendations: [] } })),
          axios.get(`http://localhost:8000/api/recommendations/${currentEmotion}/idioms`, { headers }).catch(e => ({ data: { recommendations: [] } })),
          axios.get(`http://localhost:8000/api/recommendations/${currentEmotion}/quotes`, { headers }).catch(e => ({ data: { recommendations: [] } })),
          axios.get(`http://localhost:8000/api/recommendations/${currentEmotion}/music`, { headers }).catch(e => ({ data: { recommendations: [] } }))
        ]);

        console.log('All recommendations fetched:', {
          siddha: siddha.data.recommendations?.length || 0,
          idioms: idioms.data.recommendations?.length || 0,
          quotes: quotes.data.recommendations?.length || 0,
          music: music.data.recommendations?.length || 0
        });

        setRecommendations({
          siddha: siddha.data.recommendations || [],
          idioms: idioms.data.recommendations || [],
          quotes: quotes.data.recommendations || [],
          music: music.data.recommendations || []
        });
      } else {
        // Fetch single category
        console.log(`Fetching ${selectedCategory} for ${currentEmotion}`);
        const response = await axios.get(
          `http://localhost:8000/api/recommendations/${currentEmotion}/${selectedCategory}`,
          { headers }
        );
        console.log(`${selectedCategory} response:`, response.data);
        setRecommendations({
          [selectedCategory]: response.data.recommendations || []
        });
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to load recommendations: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendations = (type, items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          {type === 'siddha' && '🌿 Siddha Remedies'}
          {type === 'idioms' && '📖 Tamil Wisdom'}
          {type === 'quotes' && '✨ Motivational Quotes'}
          {type === 'music' && '🎵 Music Therapy'}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {type === 'siddha' && <SiddhaRemedyCard remedy={item} />}
              {type === 'idioms' && <TamilIdiomCard idiom={item} />}
              {type === 'quotes' && <MotivationalQuoteCard quote={item} />}
              {type === 'music' && <MusicPlayerCard track={item} />}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          ← Back to Categories
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Recommendations for {currentEmotion}
        </h2>
        <p className="text-gray-600">
          Here are personalized suggestions to help you feel better
        </p>
      </motion.div>

      <AnimatePresence>
        {selectedCategory === 'all' ? (
          <>
            {renderRecommendations('siddha', recommendations.siddha)}
            {renderRecommendations('idioms', recommendations.idioms)}
            {renderRecommendations('quotes', recommendations.quotes)}
            {renderRecommendations('music', recommendations.music)}
          </>
        ) : (
          renderRecommendations(selectedCategory, recommendations[selectedCategory])
        )}
      </AnimatePresence>

      {Object.keys(recommendations).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No recommendations available for this emotion yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationDisplay;
