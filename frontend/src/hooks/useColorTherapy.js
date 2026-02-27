import { useEffect, useState } from 'react';
import chroma from 'chroma-js';
import useRecommendationStore from '../store/recommendationStore';

const useColorTherapy = () => {
  const { colorTheme, userPreferences } = useRecommendationStore();
  const [currentColors, setCurrentColors] = useState({
    primary: '#ffffff',
    secondary: '#f3f4f6',
    accent: '#3b82f6'
  });

  useEffect(() => {
    // Check if color therapy is enabled and theme exists with valid colors
    if (!colorTheme || !userPreferences.enableColorTherapy) {
      return;
    }

    // Validate that all required color properties exist
    if (!colorTheme.primary_color || !colorTheme.secondary_color || !colorTheme.accent_color) {
      console.warn('Color theme missing required colors:', colorTheme);
      return;
    }

    try {
      // Create smooth color transitions
      const primaryColor = chroma(colorTheme.primary_color);
      const secondaryColor = chroma(colorTheme.secondary_color);

      // Generate gradient colors
      const gradient = chroma.scale([
        primaryColor.brighten(0.5),
        primaryColor,
        secondaryColor
      ]).mode('lch').colors(5);

      setCurrentColors({
        primary: colorTheme.primary_color,
        secondary: colorTheme.secondary_color,
        accent: colorTheme.accent_color,
        gradient: gradient,
        textColor: primaryColor.luminance() > 0.5 ? '#1f2937' : '#ffffff'
      });
    } catch (error) {
      console.error('Error processing color theme:', error);
      // Keep default colors on error
    }

  }, [colorTheme, userPreferences.enableColorTherapy]);

  return currentColors;
};

export default useColorTherapy;