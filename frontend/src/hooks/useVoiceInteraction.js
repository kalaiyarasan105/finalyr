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

  // Initialize Speech Recognition
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !SpeechSynthesis) {
      setIsSupported(false);
      console.warn('Speech Recognition or Synthesis not supported in this browser');
      return;
    }

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one phrase
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US'; // Set language

    // Recognition event handlers
    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcript with final or interim results
      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
      } else if (interimTranscript) {
        setTranscript(interimTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      // Handle specific errors
      switch (event.error) {
        case 'no-speech':
          toast.error("Didn't catch that. Please try again.");
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
          toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    synthesisRef.current = SpeechSynthesis;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!recognitionRef.current) {
      toast.error('Voice recognition not initialized');
      return;
    }

    try {
      // Clear previous transcript
      setTranscript('');
      
      // Start recognition
      recognitionRef.current.start();
      toast.success('🎤 Listening... Speak now!', { duration: 2000 });
    } catch (error) {
      console.error('Error starting recognition:', error);
      
      // If already started, stop and restart
      if (error.message.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      } else {
        toast.error('Failed to start voice recognition');
      }
    }
  }, [isSupported]);

  /**
   * Stop listening for voice input
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  /**
   * Speak text using Text-to-Speech
   * @param {string} text - The text to speak
   * @param {object} options - Voice options (rate, pitch, volume, voice)
   */
  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      toast.error('Voice output is not supported in your browser.');
      return;
    }

    if (!synthesisRef.current) {
      toast.error('Speech synthesis not initialized');
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1.0; // Speed (0.1 to 10)
    utterance.pitch = options.pitch || 1.0; // Pitch (0 to 2)
    utterance.volume = options.volume || 1.0; // Volume (0 to 1)
    
    // Select voice (prefer female English voice for natural sound)
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      
      if (event.error !== 'interrupted') {
        toast.error('Failed to play voice response');
      }
    };

    // Store current utterance
    currentUtteranceRef.current = utterance;

    // Speak
    synthesisRef.current.speak(utterance);
  }, [isSupported]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, [isSpeaking]);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  /**
   * Check if browser supports speech features
   */
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
    // State
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    
    // Methods
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    checkSupport
  };
};

export default useVoiceInteraction;
