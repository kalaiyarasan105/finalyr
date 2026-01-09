import React, { useState } from 'react';
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
import './App.css';

// Main App Layout Component
const AppLayout = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useAuth();

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
    <div className="app-layout">
      <Navigation currentView={currentView} onViewChange={handleViewChange} />
      <main className="main-view">
        {renderCurrentView()}
      </main>
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
              style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
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
