import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: '💬',
      description: 'Emotion Recognition'
    },
    {
      id: 'history',
      label: 'History',
      icon: '📚',
      description: 'Conversation History'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: '🧠',
      description: 'Emotional Insights'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Preferences'
    }
  ];

  return (
    <nav className={`navigation ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        <div className="nav-brand">
          <div className="brand-logo">🧠</div>
          {!isCollapsed && (
            <div className="brand-info">
              <h1>EmotiAI</h1>
              <p>Emotional Intelligence Platform</p>
            </div>
          )}
        </div>
        <button 
          className="collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="nav-user">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="user-details">
            <div className="user-name">{user?.username}</div>
            <div className="user-status">
              <div className="status-dot"></div>
              <span>Online</span>
            </div>
          </div>
        )}
      </div>

      <div className="nav-menu">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={isCollapsed ? `${item.label} - ${item.description}` : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && (
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <button 
          className="logout-button"
          onClick={logout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;