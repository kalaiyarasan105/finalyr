import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SimpleLogin from './components/SimpleLogin';
import SimpleRegister from './components/SimpleRegister';
import ProfessionalChatInterface from './components/ProfessionalChatInterface';
import Dashboard from './components/Dashboard';
import ConversationHistory from './components/ConversationHistory';
import EmotionalInsights from './components/EmotionalInsights';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import SimpleProtectedRoute from './components/SimpleProtectedRoute';

// Import modernization utilities
import { htmxEmotionUpdater, useEmotionUpdates } from './utils/htmx';

// Emotion Indicator Component
const EmotionIndicator = () => {
  const currentEmotion = useEmotionUpdates();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentEmotion) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentEmotion]);

  const getEmotionIcon = (emotion) => {
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
  };

  const getEmotionColor = (emotion) => {
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
  };

  if (!isVisible || !currentEmotion) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      <div 
        className={`text-2xl ${isAnimating ? 'animate-bounce-soft' : ''}`}
        style={{ color: getEmotionColor(currentEmotion.current_emotion) }}
        title={`${currentEmotion.current_emotion} (${Math.round(currentEmotion.confidence * 100)}%)`}
      >
        {getEmotionIcon(currentEmotion.current_emotion)}
      </div>
    </div>
  );
};

// Main App Layout Component
const AppLayout = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);

    // Initialize HTMX emotion updates
    htmxEmotionUpdater.startMonitoring();

    return () => {
      htmxEmotionUpdater.stopMonitoring();
    };
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view !== 'chat') {
      setSelectedConversation(null);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('chat');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigateToChat={() => setCurrentView('chat')} />;
      case 'chat':
        return <ProfessionalChatInterface selectedConversation={selectedConversation} />;
      case 'history':
        return <ConversationHistory onSelectConversation={handleSelectConversation} />;
      case 'insights':
        return <EmotionalInsights onNavigateToChat={() => setCurrentView('chat')} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigateToChat={() => setCurrentView('chat')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Real-time emotion indicator */}
      <EmotionIndicator />

      {/* HTMX emotion updates container */}
      <div id="emotion-updates" className="hidden"></div>

      <div className="flex h-screen">
        <Navigation 
          currentView={currentView} 
          onViewChange={handleViewChange}
          onCollapseChange={() => {}} // Navigation handles its own collapse state
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        />
        
        <main className="flex-1 overflow-auto transition-all duration-300">
          <div className="fade-in">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg',
              style: {
                borderRadius: '0.5rem',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/register" element={<SimpleRegister />} />
            <Route 
              path="/" 
              element={
                <SimpleProtectedRoute>
                  <AppLayout />
                </SimpleProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
