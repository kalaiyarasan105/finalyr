import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for voice input (Speech-to-Text) and voice output (Text-to-Speech)
 * Uses Web Speech API for browser-based speech recognition and synthesis
 */
const useVoiceInteraction = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  // Callback refs for live voice mode
  const onFinalTranscriptRef = useRef(null);
  const onSpeakEndRef = useRef(null);
  const liveModeRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !SpeechSynthesis) {
      setIsSupported(false);
      console.warn('Speech Recognition or Synthesis not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interimTranscript += t;
        }
      }

      if (finalTranscript) {
        const trimmed = finalTranscript.trim();
        setTranscript(trimmed);
        // In live mode, fire the callback with the final transcript
        if (liveModeRef.current && onFinalTranscriptRef.current) {
          onFinalTranscriptRef.current(trimmed);
        }
      } else if (interimTranscript) {
        setTranscript(interimTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      switch (event.error) {
        case 'no-speech':
          if (!liveModeRef.current) toast.error("Didn't catch that. Please try again.");
          break;
        case 'audio-capture':
          toast.error('No microphone found. Please check your device.');
          break;
        case 'not-allowed':
          toast.error('Microphone permission denied. Please allow access.');
          break;
        case 'network':
          toast.error('Network error. Please check your connection.');
          break;
        default:
          break;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    synthesisRef.current = SpeechSynthesis;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      recognitionRef.current.start();
      if (!liveModeRef.current) toast.success('🎤 Listening... Speak now!', { duration: 2000 });
    } catch (error) {
      if (error.message.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  /**
   * Start live voice-to-voice mode.
   * onFinalTranscript(text) — called when user finishes speaking
   * onSpeakEnd() — called when bot finishes speaking (ready to listen again)
   */
  const startLiveMode = useCallback((onFinalTranscript, onSpeakEnd) => {
    liveModeRef.current = true;
    onFinalTranscriptRef.current = onFinalTranscript;
    onSpeakEndRef.current = onSpeakEnd;
    setTranscript('');
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // already started
    }
  }, []);

  const stopLiveMode = useCallback(() => {
    liveModeRef.current = false;
    onFinalTranscriptRef.current = null;
    onSpeakEndRef.current = null;
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    synthesisRef.current?.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !synthesisRef.current) return;

    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      // In live mode, restart listening after bot finishes speaking
      if (liveModeRef.current) {
        if (onSpeakEndRef.current) onSpeakEndRef.current();
        setTimeout(() => {
          try {
            setTranscript('');
            recognitionRef.current?.start();
          } catch (e) {}
        }, 300);
      }
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      if (event.error !== 'interrupted' && !liveModeRef.current) {
        toast.error('Failed to play voice response');
      }
    };

    currentUtteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  }, [isSupported]);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, [isSpeaking]);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    return {
      recognition: !!SpeechRecognition,
      synthesis: !!SpeechSynthesis,
      full: !!(SpeechRecognition && SpeechSynthesis)
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    checkSupport,
    startLiveMode,
    stopLiveMode,
  };
};

export default useVoiceInteraction;
