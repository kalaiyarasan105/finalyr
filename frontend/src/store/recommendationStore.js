import { create } from 'zustand';

const useRecommendationStore = create((set) => ({
  // Current emotion detected
  currentEmotion: null,
  
  // Selected category (siddha, idioms, quotes, music, all)
  selectedCategory: null,
  
  // Fetched recommendations
  recommendations: [],
  
  // Color theme for current emotion
  colorTheme: null,
  
  // User preferences
  userPreferences: {
    enableColorTherapy: true,
    enableMusic: true,
    preferredCategories: []
  },
  
  // Loading states
  isLoading: false,
  
  // Actions
  setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  setRecommendations: (recommendations) => set({ recommendations }),
  
  setColorTheme: (colorTheme) => set({ colorTheme }),
  
  setUserPreferences: (preferences) => set({ userPreferences: preferences }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  resetRecommendations: () => set({
    selectedCategory: null,
    recommendations: [],
    isLoading: false
  })
}));

export default useRecommendationStore;
