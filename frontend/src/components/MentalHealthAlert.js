import React, { useState } from 'react';

/**
 * MentalHealthAlert
 * Renders a gentle, dismissible support banner when the backend detects
 * a prolonged negative emotional state. It never interrupts the chat flow —
 * it simply appears below the latest message and can be closed at any time.
 */
const MentalHealthAlert = ({ alert, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  if (!alert || !alert.risk_detected) return null;

  return (
    <div className="mental-health-alert" role="alert" aria-live="polite">
      {/* Soft header bar */}
      <div className="mha-header">
        <span className="mha-icon">💛</span>
        <p className="mha-message">{alert.alert_message}</p>
        <button
          className="mha-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss support message"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Expandable suggestions */}
      {alert.suggestions && alert.suggestions.length > 0 && (
        <>
          <button
            className="mha-toggle"
            onClick={() => setExpanded(prev => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide support options ▲' : 'See support options ▼'}
          </button>

          {expanded && (
            <ul className="mha-suggestions">
              {alert.suggestions.map((s, i) => (
                <li key={i} className="mha-suggestion-item">
                  <span className="mha-bullet">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default MentalHealthAlert;
