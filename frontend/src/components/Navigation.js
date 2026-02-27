import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmotionUpdates } from '../utils/htmx';

const Navigation = ({ currentView, onViewChange, onCollapseChange, className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const currentEmotion = useEmotionUpdates();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Overview & Analytics',
      icon: '📊'
    },
    {
      id: 'chat',
      label: 'Chat',
      description: 'Emotion Recognition',
      icon: '💬'
    },
    {
      id: 'history',
      label: 'History',
      description: 'Conversation History',
      icon: '📝'
    },
    {
      id: 'insights',
      label: 'Insights',
      description: 'Emotional Insights',
      icon: '🧠'
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Preferences',
      icon: '⚙️'
    }
  ];

  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: '😊',
      sadness: '😢',
      depression: '😞',
      anger: '😠',
      anxiety: '😰',
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
      depression: '#1e40af',
      anger: '#ef4444',
      anxiety: '#f59e0b',
      fear: '#8b5cf6',
      surprise: '#f59e0b',
      disgust: '#84cc16',
      neutral: '#6b7280'
    };
    return colors[emotion] || '#6b7280';
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  return (
    <nav 
      className={`${className} ${isCollapsed ? 'nav-collapsed' : 'nav-expanded'} nav-transition bg-high-contrast border-r border-contrast flex flex-col h-full shadow-lg`}
    >
      {/* Header */}
      <div className="p-4 border-b border-contrast">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">EA</span>
            </div>
            {!isCollapsed && (
              <div className={`${isCollapsed ? 'text-fade-out' : 'text-fade-in'}`}>
                <h1 className="text-xl font-bold text-high-contrast">
                  EmotiAI
                </h1>
                <p className="text-xs text-low-contrast">
                  Emotional Intelligence Platform
                </p>
              </div>
            )}
          </div>
          <button 
            className="nav-collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
            aria-label={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            <svg 
              className={`w-5 h-5 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-contrast">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className={`${isCollapsed ? 'text-fade-out' : 'text-fade-in'} min-w-0 flex-1`}>
              <div className="font-semibold text-high-contrast truncate">
                {user?.username}
              </div>
              <div className="flex items-center gap-2 text-sm text-medium-contrast">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></div>
                <span>Online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item group ${
                currentView === item.id
                  ? 'nav-item-active'
                  : 'nav-item-inactive'
              }`}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? `${item.label} - ${item.description}` : ''}
              aria-label={`${item.label} - ${item.description}`}
            >
              <div className="text-xl flex-shrink-0">
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className={`text-left min-w-0 flex-1 ${isCollapsed ? 'text-fade-out' : 'text-fade-in'}`}>
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-xs opacity-75 truncate">
                    {item.description}
                  </div>
                </div>
              )}
              {currentView === item.id && !isCollapsed && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Emotion Indicator */}
      {currentEmotion && (
        <div className="p-4 border-t border-contrast">
          <div 
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <div 
              className="text-2xl animate-bounce-soft flex-shrink-0"
              style={{ color: getEmotionColor(currentEmotion.current_emotion) }}
            >
              {getEmotionIcon(currentEmotion.current_emotion)}
            </div>
            {!isCollapsed && (
              <div className={`${isCollapsed ? 'text-fade-out' : 'text-fade-in'} min-w-0 flex-1`}>
                <div className="text-sm font-semibold text-high-contrast capitalize truncate">
                  {currentEmotion.current_emotion}
                </div>
                <div className="text-xs text-medium-contrast">
                  {Math.round(currentEmotion.confidence * 100)}% confidence • {currentEmotion.intensity}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-contrast">
        <button 
          className="w-full flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 font-medium"
          onClick={logout}
          title={isCollapsed ? 'Logout' : ''}
          aria-label="Logout"
        >
          <div className="text-lg flex-shrink-0">🚪</div>
          {!isCollapsed && (
            <span className={`${isCollapsed ? 'text-fade-out' : 'text-fade-in'}`}>
              Logout
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;