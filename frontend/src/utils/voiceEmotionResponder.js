/**
 * Voice Emotion Responder
 * Generates empathetic, short, actionable responses based on detected emotion.
 * Returns: { opener, spokenMessage, recommendations, followUpQuestion }
 */

const RESPONSES = {
  sadness: {
    low: [
      "It sounds like something's been weighing on you a little. That's okay.",
      "I can sense a quiet heaviness in your voice. You don't have to carry it alone.",
      "Feeling a bit down happens to everyone. I'm here with you.",
    ],
    high: [
      "I can really hear the pain in your voice right now. You're not alone in this.",
      "That sounds genuinely hard. It takes courage to keep going when you feel this way.",
      "I'm so sorry you're feeling this deeply. Please be gentle with yourself right now.",
    ],
  },
  anger: {
    low: [
      "Sounds like something's been frustrating you. Totally understandable.",
      "I can hear a bit of tension there. It's okay to feel that way.",
      "A little irritation is normal — something clearly got under your skin.",
    ],
    high: [
      "I can feel how intense this frustration is. Let's slow down together for a moment.",
      "That anger is real and valid. Before anything else, let's just breathe.",
      "Something has really pushed you to your limit. I hear you — let's take this one step at a time.",
    ],
  },
  fear: {
    low: [
      "I notice a little nervousness in your voice. That's completely normal.",
      "Feeling a bit anxious? You're not alone — let's work through it.",
      "A touch of worry is okay. You're handling it better than you think.",
    ],
    high: [
      "I can hear how overwhelmed you feel right now. Let's ground ourselves first.",
      "That fear sounds very real and intense. You're safe here — let's breathe together.",
      "It's okay to feel scared. Let's take it one small step at a time.",
    ],
  },
  joy: {
    low: [
      "There's a nice warmth in your voice today. I love hearing that.",
      "You sound content — that's worth holding onto.",
      "Something good is clearly going on. That's wonderful.",
    ],
    high: [
      "Your happiness is absolutely contagious right now! This is wonderful.",
      "I can feel the joy radiating from your voice — what a great moment!",
      "You sound genuinely thrilled and that's so great to hear!",
    ],
  },
  neutral: {
    low: [
      "You sound calm and steady today.",
      "Everything seems balanced right now.",
      "You seem grounded — that's a good place to be.",
    ],
    high: [
      "You sound pretty even-keeled. Sometimes that's exactly where we need to be.",
      "Calm and collected — a great state to be in.",
      "You seem settled and clear-headed right now.",
    ],
  },
  surprise: {
    low: [
      "Something caught you off guard there! Life loves to surprise us.",
      "That sounds unexpected! Take a breath.",
    ],
    high: [
      "Wow, that clearly came out of nowhere for you! Take a breath — what happened?",
      "That sounds like a real shock. Give yourself a moment to process it.",
    ],
  },
  disgust: {
    low: [
      "Something's clearly bothered you there. That reaction makes sense.",
      "I can hear the distaste in your voice. Your feelings are valid.",
    ],
    high: [
      "That sounds deeply unsettling. It's okay to feel strongly about things that go against your values.",
      "Your reaction is completely understandable. Something has really crossed a line for you.",
    ],
  },
};

const SUGGESTIONS = {
  sadness: [
    ["Reach out to someone you trust — even a short message helps.", "Put on a song that usually lifts your mood.", "Write down what you're feeling — even a few lines can bring relief."],
    ["Take a short walk outside and let yourself breathe.", "Make something warm to drink and sit quietly for a moment.", "Call or text someone who makes you feel safe."],
    ["Listen to music that matches your mood — it's okay to feel it.", "Write one sentence about what's on your heart right now.", "Do one small kind thing for yourself today."],
  ],
  anger: [
    ["Take 5 slow deep breaths — in for 4, out for 6.", "Step away from the situation for a few minutes.", "Try a quick physical release — a brisk walk or some jumping jacks."],
    ["Splash cold water on your face and take a pause.", "Write down what's frustrating you without filtering yourself.", "Count slowly to 10 before responding to anything."],
    ["Put on calming music and sit with the feeling.", "Go for a short walk to burn off the tension.", "Take 3 deep breaths and remind yourself you're in control."],
  ],
  fear: [
    ["Try the 5-4-3-2-1 technique: name 5 things you can see right now.", "Take slow deep breaths — focus only on the exhale.", "Remind yourself: you've handled hard things before."],
    ["Place your feet flat on the floor and feel the ground beneath you.", "Take a short break from whatever is triggering the anxiety.", "Say out loud: I am safe right now."],
    ["Breathe in for 4 counts, hold for 4, out for 6.", "Focus on one small thing you can control right now.", "Talk to someone you trust about what's worrying you."],
  ],
  joy: [
    ["Share this feeling with someone who matters to you.", "Take a moment to really savour what's making you happy.", "Channel this energy into something creative."],
    ["Write down what's making you feel this way — capture it.", "Do something kind for someone else while you're feeling great.", "Celebrate this moment — you deserve it."],
    ["Call someone and share the good news.", "Take a photo or write a note to remember this feeling.", "Use this energy to tackle something you've been putting off."],
  ],
  neutral: [
    ["Reflect on one thing you're grateful for today.", "Set a small intention for the rest of your day.", "Check in with yourself — is there something you've been putting off?"],
    ["Take a few deep breaths and notice how you feel.", "Do one thing today that brings you a little joy.", "Reach out to someone you haven't spoken to in a while."],
    ["Write down one goal for today, however small.", "Step outside for a few minutes and get some fresh air.", "Ask yourself: what would make today feel meaningful?"],
  ],
  surprise: [
    ["Give yourself a moment to process before reacting.", "Talk it through with someone to get perspective.", "Write down your initial thoughts while they're fresh."],
    ["Take a breath and let the surprise settle.", "Ask yourself how you feel about this unexpected news.", "Share it with someone — surprises are better processed together."],
  ],
  disgust: [
    ["Take a step back and give yourself space from what's bothering you.", "Talk to someone you trust about how you're feeling.", "Channel the feeling into something constructive — write, create, or move."],
    ["Remove yourself from the situation if you can.", "Take a few deep breaths and ground yourself.", "Remind yourself that your values and boundaries matter."],
  ],
};

const FOLLOW_UP_QUESTIONS = [
  "Would you like to explore more recommendations to feel better?",
  "Want me to suggest some more ways to support you right now?",
  "Would you like to see more personalised recommendations for how you're feeling?",
  "Can I share some more ideas that might help you feel better?",
  "Would you like to explore some deeper support options?",
];

const lastSuggestionIndex = {};
const lastFollowUpIndex = { val: -1 };
const lastResponseIndex = {};

function pickSuggestions(emotion) {
  const pool = SUGGESTIONS[emotion] || SUGGESTIONS.neutral;
  const last = lastSuggestionIndex[emotion] ?? -1;
  let idx = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && idx === last) idx = (idx + 1) % pool.length;
  lastSuggestionIndex[emotion] = idx;
  return pool[idx];
}

function pickFollowUp() {
  const last = lastFollowUpIndex.val;
  let idx = Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length);
  if (FOLLOW_UP_QUESTIONS.length > 1 && idx === last) idx = (idx + 1) % FOLLOW_UP_QUESTIONS.length;
  lastFollowUpIndex.val = idx;
  return FOLLOW_UP_QUESTIONS[idx];
}

function pickOpener(pool, key) {
  const last = lastResponseIndex[key] ?? -1;
  let idx = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && idx === last) idx = (idx + 1) % pool.length;
  lastResponseIndex[key] = idx;
  return pool[idx];
}

/**
 * Generate a voice emotion response.
 * @param {string} emotion
 * @param {number} intensity - 0.0–1.0 or 0–100
 * @param {string|null} textEmotion
 * @returns {{ opener, spokenMessage, recommendations, followUpQuestion }}
 */
export function generateVoiceResponse(emotion, intensity, textEmotion = null) {
  const emotionKey = (emotion || 'neutral').toLowerCase().trim();
  const intensityPct = intensity > 1 ? intensity : intensity * 100;
  const tier = intensityPct >= 70 ? 'high' : 'low';

  // Mismatch detection
  if (
    textEmotion &&
    textEmotion.toLowerCase().trim() !== emotionKey &&
    textEmotion.toLowerCase().trim() !== 'neutral' &&
    emotionKey !== 'neutral'
  ) {
    const followUp = pickFollowUp();
    const opener = "I notice a slight mismatch between your tone and words. Want to share more?";
    return {
      opener,
      spokenMessage: `${opener} ${followUp}`,
      recommendations: [
        "Take a moment to check in with how you're really feeling.",
        "Sometimes our words and emotions don't quite match — that's okay.",
        "Feel free to share whatever is on your mind.",
      ],
      followUpQuestion: followUp,
    };
  }

  const emotionResponses = RESPONSES[emotionKey] || RESPONSES.neutral;
  const pool = emotionResponses[tier] || emotionResponses.low;
  const opener = pickOpener(pool, `${emotionKey}_${tier}`);
  const suggestions = pickSuggestions(emotionKey);
  const followUpQuestion = pickFollowUp();

  const spokenMessage = `${opener} Here are a few things that might help. ${suggestions.join('. ')}. ${followUpQuestion}`;

  return {
    opener,
    spokenMessage,
    recommendations: suggestions,
    followUpQuestion,
  };
}
