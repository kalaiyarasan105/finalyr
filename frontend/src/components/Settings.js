import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/auth';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    autoSave: true,
    webcamEnabled: true,
    confidenceThreshold: 0.6,
    defaultTimeframe: 30,
    language: 'en'
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: 90,
    shareAnalytics: false,
    exportData: false,
    deleteAccount: false
  });

  useEffect(() => {
    loadUserPreferences();
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const loadUserPreferences = () => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  };

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    toast.success('Preferences saved successfully');
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    setPreferences(prev => ({
      ...prev,
      theme: newDarkMode ? 'dark' : 'light'
    }));
    
    toast.success(`Switched to ${newDarkMode ? 'dark' : 'light'} theme`);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Update profile information
      if (profileData.username !== user.username || profileData.email !== user.email) {
        await api.put('/users/profile', {
          username: profileData.username,
          email: profileData.email
        });
      }
      
      // Update password if provided
      if (profileData.newPassword && profileData.currentPassword) {
        await api.put('/users/password', {
          current_password: profileData.currentPassword,
          new_password: profileData.newPassword
        });
      }
      
      toast.success('Profile updated successfully');
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock export file
      const exportData = {
        user: user,
        preferences: preferences,
        exportDate: new Date().toISOString(),
        note: 'This is a simulated data export. In a real application, this would contain all user data.'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emotiAI-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );
    
    if (!confirmed) return;
    
    const password = prompt('Enter your password to confirm account deletion:');
    
    if (!password) {
      toast.error('Account deletion cancelled');
      return;
    }
    
    setLoading(true);
    try {
      await api.delete('/users/account', {
        data: { password }
      });
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account, preferences, and privacy settings</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-divider">
                  <h3>Change Password</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Updating...' : '💾 Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>App Preferences</h2>
              
              <div className="preference-group">
                <h3>Appearance</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Dark Mode</label>
                    <p>Switch between light and dark themes</p>
                  </div>
                  <button
                    className={`toggle-switch ${darkMode ? 'active' : ''}`}
                    onClick={toggleTheme}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>
              </div>

              <div className="preference-group">
                <h3>Notifications</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Enable Notifications</label>
                    <p>Receive notifications about insights and updates</p>
                  </div>
                  <button
                    className={`toggle-switch ${preferences.notifications ? 'active' : ''}`}
                    onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>
              </div>

              <div className="preference-group">
                <h3>Camera & Detection</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Enable Webcam</label>
                    <p>Allow facial emotion detection via camera</p>
                  </div>
                  <button
                    className={`toggle-switch ${preferences.webcamEnabled ? 'active' : ''}`}
                    onClick={() => setPreferences(prev => ({ ...prev, webcamEnabled: !prev.webcamEnabled }))}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <label>Confidence Threshold</label>
                    <p>Minimum confidence for emotion detection (0.1 - 1.0)</p>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={preferences.confidenceThreshold}
                    onChange={(e) => setPreferences(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                    className="range-input"
                  />
                  <span className="range-value">{preferences.confidenceThreshold}</span>
                </div>
              </div>

              <div className="preference-group">
                <h3>Analytics</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Default Timeframe</label>
                    <p>Default period for analytics (days)</p>
                  </div>
                  <select
                    value={preferences.defaultTimeframe}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultTimeframe: parseInt(e.target.value) }))}
                    className="form-select"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
              </div>

              <button onClick={savePreferences} className="btn-primary">
                💾 Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Data</h2>
              
              <div className="privacy-group">
                <h3>Data Management</h3>
                
                <div className="privacy-item">
                  <div className="privacy-info">
                    <h4>Export Your Data</h4>
                    <p>Download a copy of all your data including conversations, analytics, and preferences</p>
                  </div>
                  <button onClick={handleExportData} className="btn-secondary" disabled={loading}>
                    {loading ? '⏳ Exporting...' : '📥 Export Data'}
                  </button>
                </div>

                <div className="privacy-item">
                  <div className="privacy-info">
                    <h4>Data Retention</h4>
                    <p>How long to keep your conversation data</p>
                  </div>
                  <select
                    value={privacySettings.dataRetention}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                    className="form-select"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                    <option value={-1}>Forever</option>
                  </select>
                </div>
              </div>

              <div className="privacy-group danger-zone">
                <h3>Danger Zone</h3>
                
                <div className="privacy-item">
                  <div className="privacy-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button onClick={handleDeleteAccount} className="btn-danger" disabled={loading}>
                    {loading ? '⏳ Deleting...' : '🗑️ Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>About EmotiAI</h2>
              
              <div className="about-content">
                <div className="app-info">
                  <div className="app-logo">🧠</div>
                  <h3>EmotiAI</h3>
                  <p className="version">Version 2.0.0</p>
                  <p className="description">
                    Advanced emotion recognition platform powered by AI. 
                    Analyze emotions through text and facial expressions with 
                    comprehensive insights and analytics.
                  </p>
                </div>

                <div className="features-list">
                  <h4>Features</h4>
                  <ul>
                    <li>🤖 AI-powered emotion detection</li>
                    <li>📊 Comprehensive analytics dashboard</li>
                    <li>💬 Context-aware conversations</li>
                    <li>📷 Real-time facial emotion analysis</li>
                    <li>🧠 Advanced emotion fusion algorithms</li>
                    <li>📈 Emotional intelligence insights</li>
                    <li>🌙 Dark/Light theme support</li>
                    <li>🔒 Privacy-focused design</li>
                  </ul>
                </div>

                <div className="tech-stack">
                  <h4>Technology Stack</h4>
                  <div className="tech-grid">
                    <div className="tech-item">
                      <strong>Frontend:</strong> React 18, Modern CSS
                    </div>
                    <div className="tech-item">
                      <strong>Backend:</strong> FastAPI, Python
                    </div>
                    <div className="tech-item">
                      <strong>AI Models:</strong> DistilBERT, Vision Transformer
                    </div>
                    <div className="tech-item">
                      <strong>Database:</strong> SQLite with SQLAlchemy
                    </div>
                  </div>
                </div>

                <div className="support-info">
                  <h4>Support & Feedback</h4>
                  <p>
                    For support, feedback, or feature requests, please contact our team.
                    We're constantly working to improve your emotional intelligence experience.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;