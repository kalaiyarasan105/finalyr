import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/auth';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
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

  const fetchConversationData = async () => {
    try {
      // Import conversation API
      const { conversationAPI } = await import('../api/conversations');
      
      // Fetch all conversations
      const conversations = await conversationAPI.getConversations();
      
      // Fetch full details for each conversation including messages
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => {
          try {
            const fullConversation = await conversationAPI.getConversation(conv.id);
            
            // Calculate dominant emotion and average confidence from messages
            const userMessages = fullConversation.messages.filter(msg => msg.is_user_message && msg.final_emotion);
            
            let dominantEmotion = null;
            let averageConfidence = 0;
            
            if (userMessages.length > 0) {
              // Count emotion occurrences
              const emotionCounts = {};
              let totalConfidence = 0;
              
              userMessages.forEach(msg => {
                emotionCounts[msg.final_emotion] = (emotionCounts[msg.final_emotion] || 0) + 1;
                totalConfidence += msg.final_confidence || 0;
              });
              
              // Find dominant emotion
              dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
                emotionCounts[a] > emotionCounts[b] ? a : b
              );
              
              // Calculate average confidence
              averageConfidence = totalConfidence / userMessages.length;
            }
            
            // Format messages
            const formattedMessages = fullConversation.messages.map(msg => ({
              message_id: msg.id,
              sender: msg.is_user_message ? 'user' : 'ai',
              text: msg.content,
              detected_emotion: msg.final_emotion || null,
              confidence: msg.final_confidence || null,
              timestamp: msg.created_at
            }));
            
            return {
              conversation_id: fullConversation.id,
              title: fullConversation.title,
              created_at: fullConversation.created_at,
              dominant_emotion: dominantEmotion,
              average_confidence: averageConfidence,
              messages: formattedMessages
            };
          } catch (error) {
            console.error(`Error fetching conversation ${conv.id}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any failed conversation fetches
      return conversationsWithMessages.filter(conv => conv !== null);
    } catch (error) {
      console.error('Error fetching conversation data:', error);
      throw error;
    }
  };

  const exportAsJSON = (exportData) => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotiAI-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = (exportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('EmotiAI Data Export Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Export Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Export Date: ${new Date(exportData.exportDate).toLocaleString()}`, 14, yPos);
    yPos += 10;

    // User Information Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('User Information', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Username: ${exportData.user.username}`, 14, yPos);
    yPos += 6;
    doc.text(`Email: ${exportData.user.email}`, 14, yPos);
    yPos += 6;
    doc.text(`User ID: ${exportData.user.id}`, 14, yPos);
    yPos += 12;

    // Emotional Summary Section
    if (exportData.conversations && exportData.conversations.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Emotional Summary', 14, yPos);
      yPos += 8;

      // Calculate emotion distribution
      const emotionCounts = {};
      let totalMessages = 0;
      let totalConfidence = 0;
      let confidenceCount = 0;

      exportData.conversations.forEach(conv => {
        conv.messages.forEach(msg => {
          if (msg.sender === 'user' && msg.detected_emotion) {
            emotionCounts[msg.detected_emotion] = (emotionCounts[msg.detected_emotion] || 0) + 1;
            totalMessages++;
            if (msg.confidence) {
              totalConfidence += msg.confidence;
              confidenceCount++;
            }
          }
        });
      });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Conversations: ${exportData.conversations.length}`, 14, yPos);
      yPos += 6;
      doc.text(`Total Messages: ${totalMessages}`, 14, yPos);
      yPos += 6;
      
      if (confidenceCount > 0) {
        const avgConfidence = (totalConfidence / confidenceCount * 100).toFixed(1);
        doc.text(`Average AI Confidence: ${avgConfidence}%`, 14, yPos);
        yPos += 10;
      } else {
        yPos += 4;
      }

      // Emotion Distribution
      if (Object.keys(emotionCounts).length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Emotion Distribution:', 14, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        Object.entries(emotionCounts)
          .sort((a, b) => b[1] - a[1])
          .forEach(([emotion, count]) => {
            const percentage = ((count / totalMessages) * 100).toFixed(1);
            doc.text(`  ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${count} (${percentage}%)`, 14, yPos);
            yPos += 5;
          });
        yPos += 8;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Conversation List
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Conversation History', 14, yPos);
      yPos += 8;

      exportData.conversations.forEach((conv, index) => {
        // Check if we need a new page
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${conv.title}`, 14, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Created: ${new Date(conv.created_at).toLocaleString()}`, 18, yPos);
        yPos += 5;
        
        if (conv.dominant_emotion) {
          doc.text(`Dominant Emotion: ${conv.dominant_emotion} (${(conv.average_confidence * 100).toFixed(1)}% confidence)`, 18, yPos);
          yPos += 5;
        }
        
        doc.text(`Messages: ${conv.messages.length}`, 18, yPos);
        yPos += 8;

        // Add sample messages (first 3)
        const sampleMessages = conv.messages.slice(0, 3);
        sampleMessages.forEach(msg => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          const senderLabel = msg.sender === 'user' ? 'You' : 'AI';
          doc.setFont(undefined, 'bold');
          doc.text(`${senderLabel}:`, 22, yPos);
          doc.setFont(undefined, 'normal');
          
          // Wrap text
          const textLines = doc.splitTextToSize(msg.text, pageWidth - 30);
          doc.text(textLines, 22, yPos + 4);
          yPos += (textLines.length * 4) + 3;

          if (msg.detected_emotion) {
            doc.setFontSize(8);
            doc.text(`[${msg.detected_emotion}, ${(msg.confidence * 100).toFixed(0)}%]`, 22, yPos);
            doc.setFontSize(9);
            yPos += 4;
          }
        });

        if (conv.messages.length > 3) {
          doc.setFontSize(8);
          doc.setFont(undefined, 'italic');
          doc.text(`... and ${conv.messages.length - 3} more messages`, 22, yPos);
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          yPos += 6;
        }

        yPos += 4;
      });
    }

    // Save PDF
    doc.save(`emotiAI-data-export-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportAsCSV = (exportData) => {
    // CSV Headers
    const headers = ['conversation_id', 'conversation_title', 'sender', 'message', 'emotion', 'confidence', 'timestamp'];
    
    // Build CSV rows
    const rows = [headers];
    
    if (exportData.conversations) {
      exportData.conversations.forEach(conv => {
        conv.messages.forEach(msg => {
          rows.push([
            conv.conversation_id,
            `"${conv.title.replace(/"/g, '""')}"`, // Escape quotes
            msg.sender,
            `"${msg.text.replace(/"/g, '""')}"`, // Escape quotes
            msg.detected_emotion || '',
            msg.confidence ? msg.confidence.toFixed(4) : '',
            msg.timestamp
          ]);
        });
      });
    }
    
    // Convert to CSV string
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotiAI-data-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportData = async (format = 'json') => {
    setLoading(true);
    setShowExportModal(false);
    
    try {
      // Fetch conversation data
      const validConversations = await fetchConversationData();
      
      // Create comprehensive export data
      const exportData = {
        user: {
          username: user.username,
          email: user.email,
          id: user.id
        },
        preferences: preferences,
        conversations: validConversations,
        exportDate: new Date().toISOString(),
        note: 'Complete data export including all conversations and messages from EmotiAI.'
      };
      
      // Export based on selected format
      switch (format) {
        case 'pdf':
          exportAsPDF(exportData);
          toast.success(`PDF exported successfully (${validConversations.length} conversations)`);
          break;
        case 'csv':
          exportAsCSV(exportData);
          toast.success(`CSV exported successfully (${validConversations.length} conversations)`);
          break;
        case 'json':
        default:
          exportAsJSON(exportData);
          toast.success(`JSON exported successfully (${validConversations.length} conversations)`);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
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
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'about', label: 'About' }
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
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activeTab === tab.id ? 'bg-primary-600' : 'bg-gray-400'
                }`}></div>
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
                  {loading ? 'Updating...' : 'Update Profile'}
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
                Save Preferences
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
                  <button onClick={() => setShowExportModal(true)} className="btn-secondary" disabled={loading}>
                    {loading ? 'Exporting...' : 'Export Data'}
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
                    {loading ? 'Deleting...' : 'Delete Account'}
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
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    EA
                  </div>
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
                    <li>AI-powered emotion detection</li>
                    <li>Comprehensive analytics dashboard</li>
                    <li>Context-aware conversations</li>
                    <li>Real-time facial emotion analysis</li>
                    <li>Advanced emotion fusion algorithms</li>
                    <li>Emotional intelligence insights</li>
                    <li>Dark/Light theme support</li>
                    <li>Privacy-focused design</li>
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

      {/* Export Format Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Export Format</h3>
            <p className="export-modal-description">
              Select the format for your data export
            </p>
            
            <div className="export-format-options">
              <button
                className="export-format-btn"
                onClick={() => handleExportData('json')}
                disabled={loading}
              >
                <div className="format-icon">📄</div>
                <div className="format-info">
                  <h4>JSON</h4>
                  <p>Developer format - Complete structured data</p>
                </div>
              </button>

              <button
                className="export-format-btn"
                onClick={() => handleExportData('pdf')}
                disabled={loading}
              >
                <div className="format-icon">📋</div>
                <div className="format-info">
                  <h4>PDF</h4>
                  <p>User-friendly report - Professional layout</p>
                </div>
              </button>

              <button
                className="export-format-btn"
                onClick={() => handleExportData('csv')}
                disabled={loading}
              >
                <div className="format-icon">📊</div>
                <div className="format-info">
                  <h4>CSV</h4>
                  <p>Tabular format - Spreadsheet compatible</p>
                </div>
              </button>
            </div>

            <button
              className="export-modal-close"
              onClick={() => setShowExportModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;