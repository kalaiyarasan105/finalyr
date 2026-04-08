import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import WebcamCapture from './WebcamCapture';
import { conversationAPI } from '../api/conversations';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import './ProfessionalChat.css';
import './CelebrationStyles.css';
import RecommendationSelector from './RecommendationSelector';
import RecommendationDisplay from './RecommendationDisplay';
import ColorTherapy from './ColorTherapy';
import useRecommendationStore from '../store/recommendationStore';
import useVoiceInteraction from '../hooks/useVoiceInteraction';

const ProfessionalChatInterface = ({ selectedConversation }) => {
  const webcamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [userText, setUserText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [emotionStats, setEmotionStats] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { user, logout } = useAuth();
  
  // Recommendation system state
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationView, setRecommendationView] = useState('selector'); // 'selector' or 'display'
  const [recommendationMessageId, setRecommendationMessageId] = useState(null); // Track which message shows recommendations
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationEmotion, setCelebrationEmotion] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const fireworksCanvasRef = useRef(null);
  const { 
    setCurrentEmotion, 
    setSelectedCategory, 
    setColorTheme, 
    resetRecommendations 
  } = useRecommendationStore();

  // Voice interaction hook
  const {
    isListening,
    isSpeaking,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript
  } = useVoiceInteraction();

  // Track which message is currently being spoken
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  useEffect(() => {
    loadConversations();
    // Load theme preference and apply to entire app
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update text input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setUserText(transcript);
    }
  }, [transcript]);

  // Handle selectedConversation prop from history page
  useEffect(() => {
    if (selectedConversation) {
      loadSelectedConversation(selectedConversation);
    }
  }, [selectedConversation]);

  const loadSelectedConversation = async (conversation) => {
    try {
      // Fetch full conversation data with messages
      const fullConv = await conversationAPI.getConversation(conversation.id);
      setCurrentConversation(fullConv);
      setMessages(fullConv.messages || []);
      toast.success(`Loaded conversation: ${fullConv.title}`);
    } catch (error) {
      toast.error('Failed to load selected conversation');
      console.error('Error loading conversation:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when recommendations are shown
    if (showRecommendations) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [showRecommendations, recommendationView]);

  useEffect(() => {
    calculateEmotionStats();
  }, [messages]);

  // Scroll progress indicator
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const scrollTop = messagesContainer.scrollTop;
      const scrollHeight = messagesContainer.scrollHeight;
      const clientHeight = messagesContainer.clientHeight;
      
      // Calculate scroll percentage
      const totalScrollable = scrollHeight - clientHeight;
      const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    // Initial calculation
    handleScroll();

    return () => {
      messagesContainer.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  // Fireworks animation effect
  useEffect(() => {
    if (!showFireworks || !fireworksCanvasRef.current) return;

    const canvas = fireworksCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full viewport size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fireworks = [];
    const particles = [];
    let animationId;
    let startTime = Date.now();
    const duration = 5000; // 5 seconds

    // Bright celebratory colors
    const colors = [
      { h: 45, name: 'gold' },      // Gold
      { h: 330, name: 'pink' },     // Pink
      { h: 200, name: 'blue' },     // Blue
      { h: 280, name: 'purple' },   // Purple
      { h: 15, name: 'orange' },    // Orange
      { h: 160, name: 'cyan' }      // Cyan
    ];

    class Firework {
      constructor(x, targetY, colorIndex) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.speed = 4 + Math.random() * 3;
        this.acceleration = 1.08;
        this.exploded = false;
        this.color = colors[colorIndex % colors.length];
        this.hue = this.color.h;
        this.trailLength = 20;
        this.trail = [];
      }

      update() {
        if (!this.exploded) {
          // Add trail
          this.trail.push({ x: this.x, y: this.y });
          if (this.trail.length > this.trailLength) {
            this.trail.shift();
          }

          this.speed *= this.acceleration;
          this.y -= this.speed;

          if (this.y <= this.targetY) {
            this.exploded = true;
            this.createParticles();
          }
        }
      }

      createParticles() {
        // Create MORE particles for bigger explosions
        const particleCount = 80 + Math.random() * 80; // 80-160 particles
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(this.x, this.y, this.hue));
        }
      }

      draw() {
        if (!this.exploded) {
          // Draw trail
          this.trail.forEach((point, index) => {
            const alpha = index / this.trail.length;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
            ctx.fill();
            ctx.restore();
          });

          // Draw main firework
          ctx.save();
          ctx.beginPath();
          ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
          ctx.fill();
          ctx.restore();
        }
      }
    }

    class Particle {
      constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue + Math.random() * 60 - 30; // More color variation
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 10; // Faster, bigger spread
        this.velocity = {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        };
        this.gravity = 0.15;
        this.friction = 0.97;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.008;
        this.size = 2 + Math.random() * 3; // Larger particles
        this.trail = [];
        this.trailLength = 8;
      }

      update() {
        // Add trail
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > this.trailLength) {
          this.trail.shift();
        }

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
      }

      draw() {
        // Draw trail
        this.trail.forEach((point, index) => {
          const trailAlpha = (index / this.trail.length) * point.alpha * 0.5;
          ctx.save();
          ctx.globalAlpha = trailAlpha;
          ctx.beginPath();
          ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
          ctx.fill();
          ctx.restore();
        });

        // Draw main particle with glow
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
        ctx.fill();
        ctx.restore();
      }
    }

    // Launch fireworks across the screen
    const launchFirework = (index) => {
      // Distribute fireworks across screen width
      const sections = 8;
      const sectionWidth = canvas.width / sections;
      const x = (index % sections) * sectionWidth + sectionWidth / 2 + (Math.random() - 0.5) * sectionWidth * 0.5;
      
      // Vary explosion heights
      const targetY = canvas.height * 0.15 + Math.random() * canvas.height * 0.35;
      
      fireworks.push(new Firework(x, targetY, index));
    };

    // Launch 8 fireworks with staggered timing
    const fireworkCount = 8;
    const launchIntervals = [];
    
    for (let i = 0; i < fireworkCount; i++) {
      const timeout = setTimeout(() => {
        launchFirework(i);
      }, i * 400); // Launch every 400ms
      launchIntervals.push(timeout);
    }

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Fade background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        
        if (fireworks[i].exploded) {
          fireworks.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // Continue animation if within duration and there are active elements
      if (elapsed < duration && (fireworks.length > 0 || particles.length > 0)) {
        animationId = requestAnimationFrame(animate);
      } else if (particles.length > 0) {
        // Let remaining particles finish
        animationId = requestAnimationFrame(animate);
      } else {
        // Animation complete, fade out and hide
        setShowFireworks(false);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      launchIntervals.forEach(timeout => clearTimeout(timeout));
      window.removeEventListener('resize', handleResize);
    };
  }, [showFireworks]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const calculateEmotionStats = () => {
    const stats = {};
    const userMessages = messages.filter(m => m.is_user_message && m.final_emotion);
    
    userMessages.forEach(msg => {
      const emotion = msg.final_emotion;
      if (!stats[emotion]) {
        stats[emotion] = { count: 0, totalConfidence: 0, intensities: {} };
      }
      stats[emotion].count++;
      stats[emotion].totalConfidence += msg.final_confidence || 0;
      
      const intensity = msg.emotion_intensity || 'medium';
      stats[emotion].intensities[intensity] = (stats[emotion].intensities[intensity] || 0) + 1;
    });

    // Calculate averages
    Object.keys(stats).forEach(emotion => {
      stats[emotion].avgConfidence = stats[emotion].totalConfidence / stats[emotion].count;
    });

    setEmotionStats(stats);
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply to both body (for chat) and documentElement (for entire app)
    document.body.classList.toggle('dark-theme', newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const loadConversations = async () => {
    try {
      const data = await conversationAPI.getConversations();
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
        setMessages(data[0].messages || []);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await conversationAPI.createConversation();
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
      toast.success('New conversation created');
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const selectConversation = async (conv) => {
    setCurrentConversation(conv);
    try {
      const fullConv = await conversationAPI.getConversation(conv.id);
      setMessages(fullConv.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await conversationAPI.deleteConversation(convId);
        setConversations(conversations.filter(c => c.id !== convId));
        if (currentConversation?.id === convId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  // Handle webcam capture
  const handleWebcamCapture = (imageSrc) => {
    console.log('Webcam captured image:', imageSrc ? 'Success' : 'Failed');
    if (imageSrc) {
      toast.success('📸 Image captured successfully!');
    }
  };

  // Test webcam capture
  const testWebcamCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        console.log('Test capture successful');
        toast.success('📸 Test capture successful!');
        handleWebcamCapture(imageSrc);
      } else {
        console.log('Test capture failed');
        toast.error('❌ Test capture failed');
      }
    } else {
      console.log('Webcam ref not available');
      toast.error('❌ Webcam not available');
    }
  };

  const sendMessage = async () => {
    if (!userText.trim() && !showWebcam) return;
    if (!currentConversation) {
      await createNewConversation();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      if (userText.trim()) {
        formData.append('text', userText);
      }
      
      // Get webcam image if camera is active
      let imageSrc = null;
      if (webcamRef.current && showWebcam) {
        // Use the WebcamCapture component's getScreenshot method
        imageSrc = webcamRef.current.getScreenshot();
        
        if (imageSrc) {
          const blob = await (await fetch(imageSrc)).blob();
          formData.append('image', blob, 'frame.jpg');
        }
      }
      
      formData.append('conversation_id', currentConversation.id);

      const response = await conversationAPI.predictEmotion(formData);
      
      // Add user message
      const userMessage = {
        id: Date.now(),
        content: userText || '[Image]',
        is_user_message: true,
        text_emotion: response.text_emotion,
        text_confidence: response.text_confidence,
        face_emotion: response.face_emotion,
        face_confidence: response.face_confidence,
        final_emotion: response.final_emotion,
        final_confidence: response.final_confidence,
        emotion_intensity: response.emotion_intensity,
        fusion_method: response.fusion_method,
        created_at: new Date().toISOString(),
      };

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        content: response.bot_response,
        is_user_message: false,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage, botMessage]);
      setUserText('');
      
      // Trigger recommendations for negative emotions
      const negativeEmotions = ['sadness', 'sad', 'anger', 'angry', 'fear', 'fearful', 'disgust', 'disgusted'];
      const positiveEmotions = ['joy', 'happy'];
      const detectedEmotion = response.final_emotion.toLowerCase().trim();
      
      console.log('=== RECOMMENDATION TRIGGER CHECK ===');
      console.log('Detected emotion:', detectedEmotion);
      console.log('Bot message ID:', botMessage.id);
      console.log('Should trigger recommendations:', negativeEmotions.includes(detectedEmotion));
      
      if (negativeEmotions.includes(detectedEmotion)) {
        // Set which message should show recommendations (the bot's reply)
        console.log('Setting recommendation message ID to:', botMessage.id);
        setRecommendationMessageId(botMessage.id);
        
        // Trigger recommendations immediately
        await triggerRecommendations(detectedEmotion);
        console.log('Recommendations triggered, showRecommendations should be true');
      }
      
      // Trigger celebration for positive emotions
      if (positiveEmotions.includes(detectedEmotion)) {
        console.log('=== CELEBRATION TRIGGER ===');
        console.log('Positive emotion detected:', detectedEmotion);
        setCelebrationEmotion(detectedEmotion);
        setShowCelebration(true);
        setShowFireworks(true); // Trigger fireworks animation
        
        // Auto-hide celebration after 5 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
      } else {
        // Hide celebration if emotion changes to non-positive
        setShowCelebration(false);
        setShowFireworks(false);
      }
      
      // Refresh conversations to update the list
      loadConversations();
      
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerRecommendations = async (emotion) => {
    let emotionLower = emotion.toLowerCase().trim();
    
    // Normalize emotion names for API
    const emotionMap = {
      'sad': 'sadness',
      'angry': 'anger',
      'fearful': 'fear',
      'disgusted': 'disgust'
    };
    
    // Use mapped emotion if available, otherwise use original
    const apiEmotion = emotionMap[emotionLower] || emotionLower;
    
    console.log('triggerRecommendations called with emotion:', emotionLower, '-> API emotion:', apiEmotion);
    try {
      // Set current emotion in store
      setCurrentEmotion(apiEmotion);
      
      // Fetch color theme for this emotion
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/recommendations/color-theme/${apiEmotion}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Color theme response:', response.data);
      
      if (response.data.color_theme) {
        setColorTheme(response.data.color_theme);
      } else if (response.data) {
        // API returns theme directly, not wrapped
        setColorTheme(response.data);
      }
      
      // Show recommendation selector inline (not modal)
      setShowRecommendations(true);
      setRecommendationView('selector');
      
      console.log('Inline recommendations should now be visible');
      console.log('showRecommendations:', true, 'recommendationView:', 'selector');
      
      // Scroll to bottom to show recommendations
      setTimeout(() => scrollToBottom(), 200);
      
      toast.success(`💡 We have recommendations to help with ${apiEmotion}!`);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setRecommendationView('display');
    // Scroll to show the recommendations
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleBackToSelector = () => {
    setRecommendationView('selector');
    resetRecommendations();
  };

  const handleCloseRecommendations = () => {
    setShowRecommendations(false);
    setRecommendationView('selector');
    setRecommendationMessageId(null);
    resetRecommendations();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Voice input handlers
  const handleMicrophoneClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  // Voice output handler for AI messages
  const handleSpeakMessage = (messageId, messageContent) => {
    if (speakingMessageId === messageId && isSpeaking) {
      // Stop if already speaking this message
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      // Stop any current speech and start new one
      stopSpeaking();
      setSpeakingMessageId(messageId);
      speak(messageContent, {
        rate: 0.95, // Slightly slower for clarity
        pitch: 1.0,
        volume: 1.0
      });
      
      // Clear speaking state when done
      setTimeout(() => {
        setSpeakingMessageId(null);
      }, messageContent.length * 50); // Rough estimate of speech duration
    }
  };

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

  const getIntensityColor = (intensity) => {
    const colors = {
      high: '#ff4757',
      medium: '#ffa502',
      low: '#2ed573',
      very_low: '#70a1ff'
    };
    return colors[intensity] || '#747d8c';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ColorTherapy>
      <div className={`professional-chat ${darkMode ? 'dark' : 'light'} no-sidebar ${showCelebration ? 'celebration-mode-active' : ''}`}>
        
        {/* Enhanced Celebration Overlay */}
        {showCelebration && (
          <>
            {/* Full-Screen Animated Gradient Background */}
            <div className="celebration-gradient-bg"></div>
            
            {/* Confetti Burst */}
            <div className="celebration-confetti">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className={`confetti confetti-${i % 5}`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
            
            {/* Sparkle Particles */}
            <div className="celebration-sparkles-enhanced">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="sparkle-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >✨</div>
              ))}
            </div>
            
            {/* Celebration Banner */}
            <div className="celebration-banner">
              <div className="celebration-banner-content">
                <span className="celebration-banner-icon">
                  {celebrationEmotion === 'joy' ? '🎉' : '✨'}
                </span>
                <span className="celebration-banner-text">
                  {celebrationEmotion === 'joy' 
                    ? "You're glowing today!" 
                    : "Happiness detected!"}
                </span>
                <span className="celebration-banner-icon">
                  {celebrationEmotion === 'joy' ? '🎉' : '✨'}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Fireworks Canvas Overlay */}
        {showFireworks && (
          <canvas 
            ref={fireworksCanvasRef}
            className="fireworks-canvas"
          />
        )}

        {/* Main Content */}
        <div className="main-content full-width">
        <div className="chat-header">
          <div className="header-left">
            <h2>{currentConversation?.title || 'Emotion Recognition Chat'}</h2>
            <div className="header-subtitle">
              AI-powered emotional intelligence • Real-time analysis
            </div>
          </div>
          <div className="header-right">
            <div className="header-controls">
              <button 
                onClick={createNewConversation} 
                className="header-btn primary"
                title="New Conversation"
              >
                ➕ New Conversation
              </button>
              
              <button 
                onClick={toggleTheme} 
                className="header-btn secondary"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              
              <button 
                onClick={() => setShowWebcam(!showWebcam)} 
                className={`header-btn ${showWebcam ? 'success' : 'inactive'}`}
                title={showWebcam ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                📷 Camera {showWebcam ? 'On' : 'Off'}
              </button>
            </div>
            
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>AI Ready</span>
            </div>
          </div>
        </div>

        <div className="chat-body">
          <div className="messages-area">
            {/* Scroll Progress Indicator */}
            <div className="scroll-progress-container">
              <div 
                className="scroll-progress-bar"
                style={{ height: `${scrollProgress}%` }}
              ></div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h3>Welcome to EmotiAI</h3>
                  <p>I'm here to understand and respond to your emotions. Share your thoughts or show your face to get started!</p>
                  <div className="welcome-features">
                    <div className="feature">
                      <span className="feature-icon">🧠</span>
                      <span>Advanced AI emotion detection</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">📊</span>
                      <span>Emotion intensity analysis</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">💬</span>
                      <span>Context-aware responses</span>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <React.Fragment key={message.id}>
                    <div className={`message ${message.is_user_message ? 'user' : 'bot'}`}>
                      <div className="message-avatar">
                        {message.is_user_message ? 
                          user?.username?.charAt(0).toUpperCase() : 
                          '🤖'
                        }
                      </div>
                      <div className="message-content">
                        <div className="message-bubble">
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">{formatTime(message.created_at)}</div>
                          
                          {/* Voice output button for AI messages */}
                          {!message.is_user_message && isVoiceSupported && (
                            <button
                              className={`voice-output-btn ${speakingMessageId === message.id && isSpeaking ? 'speaking' : ''}`}
                              onClick={() => handleSpeakMessage(message.id, message.content)}
                              title={speakingMessageId === message.id && isSpeaking ? 'Stop speaking' : 'Read aloud'}
                            >
                              {speakingMessageId === message.id && isSpeaking ? '🔇' : '🔊'}
                            </button>
                          )}
                        </div>
                        
                        {message.is_user_message && message.final_emotion && (
                          <div className="emotion-analysis">
                            <div className="analysis-header">
                              <span className="analysis-icon">🧠</span>
                              <span>Emotion Analysis</span>
                            </div>
                            
                            <div className="emotion-grid">
                              {message.text_emotion && (
                                <div className="emotion-item">
                                  <div className="emotion-label">Text</div>
                                  <div className="emotion-value">
                                    {getEmotionIcon(message.text_emotion)} {message.text_emotion}
                                    <span className="confidence">{(message.text_confidence * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              )}
                              
                              {message.face_emotion && (
                                <div className="emotion-item">
                                  <div className="emotion-label">Face</div>
                                  <div className="emotion-value">
                                    {getEmotionIcon(message.face_emotion)} {message.face_emotion}
                                    <span className="confidence">{(message.face_confidence * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="final-emotion">
                              <div className="final-header">
                                <span className="final-icon">🎯</span>
                                <span>Final Result</span>
                              </div>
                              <div className="final-content">
                                <div className="final-emotion-display">
                                  {getEmotionIcon(message.final_emotion)} 
                                  <span className="emotion-name">{message.final_emotion}</span>
                                  <span className="final-confidence">
                                    {(message.final_confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="emotion-meta">
                                  <div className="intensity-badge" style={{backgroundColor: getIntensityColor(message.emotion_intensity)}}>
                                    {message.emotion_intensity} intensity
                                  </div>
                                  <div className="fusion-method">
                                    {message.fusion_method?.replace(/_/g, ' ')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Show recommendations inline after bot message if this is the recommendation message */}
                    {!message.is_user_message && message.id === recommendationMessageId && showRecommendations && (
                      <div className="inline-recommendations">
                        <div className="recommendation-header">
                          <h3>💡 Recommendations to Help You Feel Better</h3>
                          <button 
                            className="close-recommendations-btn"
                            onClick={handleCloseRecommendations}
                            title="Close recommendations"
                          >
                            ✕
                          </button>
                        </div>
                        {recommendationView === 'selector' ? (
                          <RecommendationSelector onSelectCategory={handleSelectCategory} />
                        ) : (
                          <RecommendationDisplay onBack={handleBackToSelector} />
                        )}
                      </div>
                    )}
                    {/* Debug info - remove after testing */}
                    {!message.is_user_message && (
                      <div style={{ display: 'none' }}>
                        Message ID: {message.id}, 
                        Recommendation ID: {recommendationMessageId}, 
                        Show: {showRecommendations ? 'yes' : 'no'},
                        Match: {message.id === recommendationMessageId ? 'yes' : 'no'}
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <div className="input-container">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening... Speak now!" : "Share your thoughts or feelings..."}
                  disabled={loading}
                  className={`message-input ${isListening ? 'listening' : ''}`}
                  rows="1"
                />
                
                {/* Voice Input Button */}
                {isVoiceSupported && (
                  <button
                    onClick={handleMicrophoneClick}
                    disabled={loading}
                    className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    <span className="mic-icon">🎤</span>
                    {isListening && (
                      <span className="listening-indicator">
                        <span className="pulse"></span>
                        <span className="pulse"></span>
                        <span className="pulse"></span>
                      </span>
                    )}
                  </button>
                )}
                
                <button 
                  onClick={sendMessage} 
                  disabled={loading || (!userText.trim() && !showWebcam)} 
                  className="send-button"
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <span className="send-icon">📤</span>
                  )}
                </button>
              </div>
              
              {/* Voice status indicator */}
              {isListening && (
                <div className="voice-status">
                  <span className="status-icon">🎤</span>
                  <span className="status-text">Listening... Speak clearly</span>
                  <button 
                    onClick={stopListening}
                    className="stop-listening-btn"
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Webcam Panel */}
          {showWebcam && (
            <div className="webcam-panel">
              <div className="webcam-header">
                <h3>📷 Live Camera</h3>
                <div className="webcam-status">
                  <div className="status-dot recording"></div>
                  <span>Recording</span>
                </div>
              </div>
              
              <WebcamCapture
                ref={webcamRef}
                onCapture={handleWebcamCapture}
                isActive={showWebcam}
                width={320}
                height={200}
                className="professional-webcam"
                showControls={true}
              />
              
              <div className="webcam-info">
                <p>🎯 Face emotion detection active</p>
                <p>📊 Real-time analysis enabled</p>
                <button 
                  onClick={testWebcamCapture}
                  className="test-capture-btn"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  📸 Test Capture
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </ColorTherapy>
  );
};

export default ProfessionalChatInterface;