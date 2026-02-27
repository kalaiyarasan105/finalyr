// Simplified HTMX Integration for Real-time Emotion Updates
// Note: This is a simplified version that can work without htmx.org dependency
import React from 'react';

class HTMXEmotionUpdater {
  constructor() {
    this.currentEmotion = null;
    this.listeners = [];
    this.init();
  }

  init() {
    console.log('✅ HTMX Emotion Updater initialized (simplified mode)');
  }

  // Simulate real-time emotion updates
  updateEmotion(emotionData) {
    this.currentEmotion = emotionData;
    this.triggerEmotionAnimation(emotionData);
  }

  triggerEmotionAnimation(emotionData) {
    const event = new CustomEvent('emotionUpdate', {
      detail: emotionData
    });
    document.dispatchEvent(event);
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

  // Start real-time emotion monitoring (simplified)
  startMonitoring() {
    console.log('Started emotion monitoring (simplified mode)');
    // Simulate periodic emotion updates for demo
    this.simulateEmotionUpdates();
  }

  // Stop real-time emotion monitoring
  stopMonitoring() {
    console.log('Stopped emotion monitoring');
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  // Simulate emotion updates for demo purposes
  simulateEmotionUpdates() {
    const emotions = ['joy', 'neutral', 'sadness', 'surprise'];
    let index = 0;
    
    this.simulationInterval = setInterval(() => {
      const emotion = emotions[index % emotions.length];
      const confidence = 0.7 + Math.random() * 0.3;
      
      this.updateEmotion({
        current_emotion: emotion,
        confidence: confidence,
        intensity: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
        timestamp: new Date().toISOString()
      });
      
      index++;
    }, 5000); // Update every 5 seconds for demo
  }
}

// Export singleton instance
export const htmxEmotionUpdater = new HTMXEmotionUpdater();

// React hook for emotion updates
export const useEmotionUpdates = () => {
  const [currentEmotion, setCurrentEmotion] = React.useState(null);

  React.useEffect(() => {
    const handleEmotionUpdate = (event) => {
      setCurrentEmotion(event.detail);
    };

    document.addEventListener('emotionUpdate', handleEmotionUpdate);
    htmxEmotionUpdater.startMonitoring();

    return () => {
      document.removeEventListener('emotionUpdate', handleEmotionUpdate);
      htmxEmotionUpdater.stopMonitoring();
    };
  }, []);

  return currentEmotion;
};