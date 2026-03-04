import React from 'react';
import './Home.css';
import robotIcon from '../assets/robot-edtim.svg';

const FeatureCard = ({ icon, title, children }) => (
  <div className="home-feature-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-medium-contrast">{children}</p>
  </div>
);

const Home = ({ onNavigateToChat }) => {
  const year = new Date().getFullYear();

  return (
    <div className="home-container p-6">
      {/* Hero */}
      <section className="home-hero grid gap-6 lg:grid-cols-2 items-center mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">AI Emotion Recognition & Wellness Assistant</h1>
          <p className="text-lg text-medium-contrast mb-4">
            Detect emotions from text and facial expressions and receive supportive, personalized recommendations to improve emotional awareness and wellbeing.
          </p>
          <div className="flex gap-3">
            <button
              className="btn-primary px-5 py-3 rounded-md font-medium"
              onClick={() => onNavigateToChat && onNavigateToChat()}
            >
              Start Chat
            </button>
            <a href="#features" className="btn-secondary px-4 py-3 rounded-md font-medium">Learn More</a>
          </div>
        </div>
        <div className="home-hero-visual p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
          <div className="flex items-center gap-4">
            <img src={robotIcon} alt="robot icon" className="robot-icon" />
            <p className="text-sm text-medium-contrast m-0">AI-powered emotion detection from text & webcam</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon="🔍" title="Emotion Detection">Text + Facial Emotion Recognition to understand feelings in messages and expressions.</FeatureCard>
          <FeatureCard icon="💬" title="AI Chat Support">Conversational AI offering empathetic responses and supportive dialogue.</FeatureCard>
          <FeatureCard icon="🌱" title="Wellness Recommendations">Personalized tips, activities, and resources to improve mental wellness.</FeatureCard>
          <FeatureCard icon="📈" title="Mood Insights & Analytics">Track mood trends and gain actionable insights over time.</FeatureCard>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <ol className="home-steps space-y-3 list-decimal pl-5 text-medium-contrast">
          <li>User enters a message or uses the webcam to capture facial cues.</li>
          <li>AI detects emotions from text and facial expressions.</li>
          <li>The system analyzes the emotional state and context.</li>
          <li>Personalized recommendations and supportive responses are provided.</li>
        </ol>
      </section>

      {/* Benefits */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
        <ul className="grid gap-3 sm:grid-cols-2 list-disc pl-5 text-medium-contrast">
          <li>Increased emotional awareness</li>
          <li>Accessible mental wellness support</li>
          <li>Help with student stress management and study wellbeing</li>
          <li>AI-driven insights for healthier habits</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="home-footer mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-medium-contrast">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <strong>EmotiAI</strong> • AI Emotion Recognition & Wellness Assistant
          </div>
          <div>
             Built by the kalai n lokesh • {year}
          </div>
        </div>
        <div className="mt-2 text-xs text-medium-contrast">Robot icons created by edt.im - Flaticon</div>
      </footer>
    </div>
  );
};

export default Home;
