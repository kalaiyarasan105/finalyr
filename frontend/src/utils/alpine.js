// Simplified Alpine.js Integration (without external dependency)
// This provides the core functionality without requiring the alpinejs package

class AlpineIntegration {
  constructor() {
    this.stores = {
      emotions: {
        current: null,
        confidence: 0,
        history: [],
        
        updateEmotion(emotion, confidence) {
          this.current = emotion;
          this.confidence = confidence;
          this.history.unshift({ emotion, confidence, timestamp: Date.now() });
          if (this.history.length > 10) this.history.pop();
        }
      },

      ui: {
        darkMode: localStorage.getItem('theme') === 'dark',
        sidebarOpen: false,
        loading: false,

        toggleDarkMode() {
          this.darkMode = !this.darkMode;
          localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
          document.documentElement.classList.toggle('dark', this.darkMode);
        }
      }
    };

    this.init();
  }

  init() {
    // Make stores available globally
    window.AlpineStores = this.stores;
    console.log('✅ Alpine.js integration initialized (simplified mode)');
  }

  // Helper methods for React components
  getEmotionColor(emotion) {
    const colors = {
      joy: '#10b981',
      sadness: '#3b82f6',
      anger: '#ef4444',
      fear: '#8b5cf6',
      surprise: '#f59e0b',
      disgust: '#84cc16',
      neutral: '#6b7280'
    };
    return colors[emotion] || '#6b7280';
  }

  getEmotionIcon(emotion) {
    const icons = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐'
    };
    return icons[emotion] || '🤔';
  }

  // Get store data
  getStore(name) {
    return this.stores[name];
  }

  // Update store data
  updateStore(name, data) {
    if (this.stores[name]) {
      Object.assign(this.stores[name], data);
    }
  }
}

// Export singleton instance
const alpineIntegration = new AlpineIntegration();

export default alpineIntegration;