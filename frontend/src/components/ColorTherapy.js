import React from 'react';
import { motion } from 'framer-motion';
import useColorTherapy from '../hooks/useColorTherapy';
import useRecommendationStore from '../store/recommendationStore';

const ColorTherapy = ({ children }) => {
  const colors = useColorTherapy();
  const { userPreferences, colorTheme } = useRecommendationStore();

  // Don't apply color therapy if disabled or no theme set
  if (!userPreferences.enableColorTherapy || !colorTheme) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-1000">
        {children}
      </div>
    );
  }

  // Build gradient string safely
  const gradientBackground = colors.gradient && colors.gradient.length >= 5
    ? `linear-gradient(135deg, ${colors.gradient[0]} 0%, ${colors.gradient[2]} 50%, ${colors.gradient[4]} 100%)`
    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

  return (
    <motion.div
      className="min-h-screen w-full transition-all duration-1000 ease-in-out"
      animate={{
        background: gradientBackground
      }}
      transition={{ duration: 2 }}
    >
      <div className="min-h-screen w-full backdrop-blur-md bg-white/20 dark:bg-gray-900/40 transition-colors duration-1000">
        {children}
      </div>
    </motion.div>
  );
};

export default ColorTherapy;