import React, { useState, useRef, useEffect, useCallback } from 'react';
import { conversationAPI } from '../api/conversations';
import useVoiceInteraction from '../hooks/useVoiceInteraction';
import { generateVoiceResponse } from '../utils/voiceEmotionResponder';
import toast from 'react-hot-toast';
import './VoiceToVoice.css';
/**
 * VoiceToVoice — a live voice conversation overlay.
 * User speaks → emotion detected → AI responds aloud → listens again.
 * Completely self-contained, does not affect existing chat functionality.
 */
const VoiceToVoice = ({ onClose, currentConversation, webcamRef, showWebcam }) => {
  const [phase, setPhase] = useState('idle'); // idle | listening | processing | speaking
  const [liveTranscript, setLiveTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [voiceRecommendations, setVoiceRecommendations] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showCategoryPrompt, setShowCategoryPrompt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryRecs, setCategoryRecs] = useState(null); // { category, items[] }
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [conversationLog, setConversationLog] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const logEndRef = useRef(null);
  const activeRef = useRef(false);

  const { isSupported, startLiveMode, stopLiveMode, speak, transcript } = useVoiceInteraction();

  // Keep transcript in sync with live display
  useEffect(() => {
    if (transcript) setLiveTranscript(transcript);
  }, [transcript]);

  // Scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog]);

  const handleFinalTranscript = useCallback(async (text) => {
    if (!activeRef.current || !text.trim()) return;

    setLiveTranscript(text);
    setPhase('processing');
    setBotResponse('');
    setVoiceRecommendations([]);
    setShowCategoryPrompt(false);
    setSelectedCategory(null);
    setCategoryRecs(null);

    try {
      const formData = new FormData();
      formData.append('text', text);

      // Capture webcam frame if available
      if (webcamRef?.current && showWebcam) {
        try {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            const blob = await (await fetch(imageSrc)).blob();
            formData.append('image', blob, 'frame.jpg');
          }
        } catch (imgErr) {
          // Webcam capture failed — continue without image
          console.warn('Webcam capture skipped:', imgErr);
        }
      }

      // Auto-create a conversation if none exists
      let convId = currentConversation?.id;
      if (!convId) {
        try {
          const newConv = await conversationAPI.createConversation('Voice Conversation');
          convId = newConv.id;
        } catch (convErr) {
          console.warn('Could not create conversation, proceeding without one:', convErr);
        }
      }

      if (convId) {
        formData.append('conversation_id', convId);
      }

      const response = await conversationAPI.predictEmotion(formData);
      const emotion = response.final_emotion || 'neutral';
      const intensity = response.final_confidence ?? 0.5;
      const textEmotion = response.text_emotion;

      // Generate empathetic voice response using the emotion responder
      const voiceResp = generateVoiceResponse(emotion, intensity, textEmotion);

      setBotResponse(voiceResp.opener);
      setDetectedEmotion(emotion);
      setVoiceRecommendations(voiceResp.recommendations);
      setFollowUpQuestion(voiceResp.followUpQuestion);
      setShowCategoryPrompt(false);

      // Add to log (only the opener for readability)
      setConversationLog(prev => [
        ...prev,
        { role: 'user', text, emotion },
        { role: 'bot', text: voiceResp.opener }
      ]);

      setLiveTranscript('');
      setPhase('speaking');

      // Speak the spokenMessage (includes follow-up question) — hook restarts listening after
      speak(voiceResp.spokenMessage, { rate: 0.95, pitch: 1.05 });

    } catch (err) {
      console.error('Voice-to-voice error:', err);

      // Graceful fallback — generate a local response without the backend
      const fallbackResp = generateVoiceResponse('neutral', 0.5);
      setBotResponse(fallbackResp.opener);
      setVoiceRecommendations(fallbackResp.recommendations);
      setFollowUpQuestion(fallbackResp.followUpQuestion);
      setShowCategoryPrompt(false);
      setConversationLog(prev => [
        ...prev,
        { role: 'user', text, emotion: 'neutral' },
        { role: 'bot', text: fallbackResp.opener }
      ]);
      setLiveTranscript('');
      setPhase('speaking');
      speak(fallbackResp.spokenMessage, { rate: 0.95, pitch: 1.05 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation, webcamRef, showWebcam, speak]);

  const handleSpeakEnd = useCallback(() => {
    if (!activeRef.current) return;
    setPhase('listening');
    setShowCategoryPrompt(true);
  }, []);

  const handleCategorySelect = useCallback(async (cat) => {
    setSelectedCategory(cat);
    setShowCategoryPrompt(false);
    setLoadingCategory(true);
    setCategoryRecs(null);

    const emotion = detectedEmotion || 'neutral';
    const token = localStorage.getItem('token');

    try {
      // Use the existing recommendation API endpoint
      const axios = (await import('axios')).default;
      const { default: API_BASE_URL } = await import('../api/config');
      const response = await axios.get(
        `${API_BASE_URL}/api/recommendations/${emotion}/${cat.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;

      // Normalise — API returns different shapes per category
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.recommendations) {
        items = data.recommendations;
      } else if (data.tracks) {
        items = data.tracks;
      } else if (data.remedies) {
        items = data.remedies;
      } else if (data.idioms) {
        items = data.idioms;
      } else if (data.quotes) {
        items = data.quotes;
      } else {
        // Fallback: wrap whatever came back
        items = [data];
      }

      setCategoryRecs({ category: cat, items: items.slice(0, 5) });

      // Speak a brief acknowledgement
      const ackMessages = {
        siddha: `Here are some Siddha remedies that may help with ${emotion}.`,
        idioms: `Here is some Tamil wisdom for you.`,
        quotes: `Here are some motivational quotes to uplift you.`,
        music: `Here are some music tracks to help with how you're feeling.`,
        all: `Here are some personalised recommendations for you.`,
      };
      speak(ackMessages[cat.id] || 'Here are some recommendations for you.', { rate: 0.95, pitch: 1.05 });

    } catch (err) {
      console.error('Category fetch error:', err);
      // Fallback: show the existing voice recommendations under this category
      setCategoryRecs({
        category: cat,
        items: voiceRecommendations.map(r => ({ action: r, title: r })),
      });
      speak(`Here are some suggestions to help you feel better.`, { rate: 0.95, pitch: 1.05 });
    } finally {
      setLoadingCategory(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedEmotion, voiceRecommendations, speak]);

  const startSession = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice not supported in this browser. Use Chrome or Edge.');
      return;
    }
    activeRef.current = true;
    setIsActive(true);
    setPhase('listening');
    setConversationLog([]);
    setBotResponse('');
    setDetectedEmotion(null);
    setLiveTranscript('');
    setFollowUpQuestion('');
    setShowCategoryPrompt(false);
    startLiveMode(handleFinalTranscript, handleSpeakEnd);
  }, [isSupported, startLiveMode, handleFinalTranscript, handleSpeakEnd]);

  const stopSession = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    setPhase('idle');
    setLiveTranscript('');
    setBotResponse('');
    setVoiceRecommendations([]);
    setFollowUpQuestion('');
    setShowCategoryPrompt(false);
    setSelectedCategory(null);
    setCategoryRecs(null);
    stopLiveMode();
  }, [stopLiveMode]);

  const handleClose = () => {
    stopSession();
    onClose();
  };

  const emotionEmoji = {
    joy: '😊', sadness: '😢', anger: '😠',
    fear: '😨', surprise: '😲', disgust: '🤢', neutral: '😐'
  };

  const REC_CATEGORIES = [
    { id: 'siddha',  label: 'Siddha Remedies', icon: '🌿' },
    { id: 'idioms',  label: 'Tamil Wisdom',    icon: '💬' },
    { id: 'quotes',  label: 'Motivational Quotes', icon: '✨' },
    { id: 'music',   label: 'Music Therapy',   icon: '🎵' },
    { id: 'all',     label: 'All Recommendations', icon: '🔮' },
  ];

  return (
    <div className="vtv-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="vtv-modal">

        {/* Header */}
        <div className="vtv-header">
          <div className="vtv-title">
            <span className="vtv-title-icon">🎙️</span>
            <span>Live Voice Conversation</span>
          </div>
          <button className="vtv-close-btn" onClick={handleClose} title="Close">✕</button>
        </div>

        {/* Main visual area */}
        <div className="vtv-body">

          {/* Orb / visualizer */}
          <div className={`vtv-orb-container phase-${phase}`}>
            <div className="vtv-orb">
              <div className="vtv-orb-ring ring-1" />
              <div className="vtv-orb-ring ring-2" />
              <div className="vtv-orb-ring ring-3" />
              <div className="vtv-orb-core">
                {phase === 'idle' && <span className="vtv-orb-icon">🎙️</span>}
                {phase === 'listening' && <span className="vtv-orb-icon">👂</span>}
                {phase === 'processing' && <span className="vtv-orb-icon">🧠</span>}
                {phase === 'speaking' && <span className="vtv-orb-icon">🤖</span>}
              </div>
            </div>
          </div>

          {/* Status label */}
          <div className="vtv-status-label">
            {phase === 'idle' && 'Press Start to begin'}
            {phase === 'listening' && (
              <span className="vtv-listening-label">
                <span className="vtv-dot" /><span className="vtv-dot" /><span className="vtv-dot" />
                Listening...
              </span>
            )}
            {phase === 'processing' && 'Analysing your emotion...'}
            {phase === 'speaking' && (
              <span className="vtv-speaking-label">
                AI is responding
                <span className="vtv-wave"><span/><span/><span/><span/><span/></span>
              </span>
            )}
          </div>

          {/* Live transcript */}
          {liveTranscript && (
            <div className="vtv-transcript">
              <span className="vtv-transcript-label">You:</span>
              <span className="vtv-transcript-text">{liveTranscript}</span>
              {detectedEmotion && (
                <span className="vtv-emotion-badge">
                  {emotionEmoji[detectedEmotion] || '🤔'} {detectedEmotion}
                </span>
              )}
            </div>
          )}

          {/* Bot response — shown during speaking and after */}
          {botResponse && (
            <div className="vtv-bot-response">
              <div className="vtv-bot-label">🤖 EmotiAI:</div>
              <div className="vtv-bot-text">{botResponse}</div>
            </div>
          )}

          {/* Voice recommendations — shown during and after speaking */}
          {voiceRecommendations.length > 0 && (phase === 'speaking' || showCategoryPrompt) && (
            <div className="vtv-recommendations">
              <div className="vtv-rec-label">💡 Try this:</div>
              <ul className="vtv-rec-list">
                {voiceRecommendations.map((rec, i) => (
                  <li key={i} className="vtv-rec-item">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up question + category prompt (shown after bot finishes speaking) */}
          {showCategoryPrompt && followUpQuestion && (
            <div className="vtv-followup">
              <p className="vtv-followup-question">🤖 {followUpQuestion}</p>
              <div className="vtv-category-grid">
                {REC_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className="vtv-category-btn"
                    onClick={() => handleCategorySelect(cat)}
                    title={cat.label}
                  >
                    <span className="vtv-cat-icon">{cat.icon}</span>
                    <span className="vtv-cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading category */}
          {loadingCategory && (
            <div className="vtv-cat-loading">
              <span className="vtv-cat-spinner" /> Fetching recommendations...
            </div>
          )}

          {/* Category recommendation results */}
          {categoryRecs && !loadingCategory && (
            <div className="vtv-cat-results">
              <div className="vtv-cat-results-header">
                <span>{categoryRecs.category.icon} {categoryRecs.category.label}</span>
                <button
                  className="vtv-cat-results-back"
                  onClick={() => { setCategoryRecs(null); setShowCategoryPrompt(true); }}
                >← Back</button>
              </div>
              <div className="vtv-cat-results-list">
                {categoryRecs.items.map((item, i) => (
                  <div key={i} className="vtv-cat-result-item">
                    <div className="vtv-cat-result-title">
                      {item.title || item.action || item.name || item.tamil_text || `Recommendation ${i + 1}`}
                    </div>
                    {(item.description || item.instructions || item.translation || item.rationale) && (
                      <div className="vtv-cat-result-desc">
                        {item.description || item.instructions || item.translation || item.rationale}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation log — only show past turns when no active response */}
          {conversationLog.length > 0 && !botResponse && (
            <div className="vtv-log">
              {conversationLog.map((entry, i) => (
                <div key={i} className={`vtv-log-entry vtv-log-${entry.role}`}>
                  <span className="vtv-log-role">
                    {entry.role === 'user' ? '🧑' : '🤖'}
                  </span>
                  <span className="vtv-log-text">{entry.text}</span>
                  {entry.emotion && (
                    <span className="vtv-log-emotion">
                      {emotionEmoji[entry.emotion] || '🤔'}
                    </span>
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="vtv-controls">
          {!isActive ? (
            <button className="vtv-start-btn" onClick={startSession}>
              <span>🎙️</span> Start Talking
            </button>
          ) : (
            <button className="vtv-stop-btn" onClick={stopSession}>
              <span>⏹</span> Stop
            </button>
          )}
        </div>

        {!isSupported && (
          <div className="vtv-unsupported">
            ⚠️ Voice not supported in this browser. Please use Chrome or Edge.
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceToVoice;
