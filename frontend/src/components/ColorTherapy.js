import React from 'react';
import { motion } from 'framer-motion';
import useColorTherapy from '../hooks/useColorTherapy';
import useRecommendationStore from '../store/recommendationStore';

const ColorTherapy = ({ children }) => {
  const colors = useColorTherapy();
  const { userPreferences, colorTheme } = useRecommendationStore();

  // Don't apply color therapy if disabled or no theme set
  if (!userPreferences.enableColorTherapy || !colorTheme) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Build gradient string safely
  const gradientBackground = colors.gradient && colors.gradient.length >= 5
    ? `linear-gradient(135deg, ${colors.gradient[0]} 0%, ${colors.gradient[2]} 50%, ${colors.gradient[4]} 100%)`
    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

  return (
    <motion.div
      className="min-h-screen transition-all duration-1000 ease-in-out"
      animate={{
        background: gradientBackground
      }}
      transition={{ duration: 2 }}
    >
      <div className="min-h-screen backdrop-blur-sm bg-white bg-opacity-30">
        {children}
      </div>
    </motion.div>
  );
};

export default ColorTherapy;