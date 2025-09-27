import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const App = () => {
  const webcamRef = useRef(null);
  const [userText, setUserText] = useState("");
  const [emotionData, setEmotionData] = useState(null);

  const captureAndSend = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    const formData = new FormData();
    if (imageSrc) {
      const blob = await (await fetch(imageSrc)).blob();
      formData.append("image", blob, "frame.jpg");
    }
    if (userText.trim() !== "") {
      formData.append("text", userText);
    }

    try {
      const res = await axios.post("http://localhost:5000/predict_multimodal", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEmotionData(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Multimodal Emotion-Aware Chatbot</h1>

      {/* Webcam */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={480}
        height={360}
        videoConstraints={{ facingMode: "user" }}
        style={{ borderRadius: "10px", border: "2px solid #ccc" }}
      />

      {/* Text input */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          style={{ width: "300px", padding: "8px" }}
        />
        <button onClick={captureAndSend} style={{ marginLeft: "10px", padding: "8px 16px" }}>
          Send
        </button>
      </div>

      {/* Response Section */}
      {emotionData && (
        <div style={{ marginTop: "30px", textAlign: "left", display: "inline-block" }}>
          <h2>Bot Response:</h2>
          <p><strong>{emotionData.bot_response}</strong></p>

          <h3>Detected Emotions:</h3>
          <ul>
            {emotionData.text_emotion && (
              <li>
                <b>Text:</b> {emotionData.text_emotion} ({(emotionData.text_confidence * 100).toFixed(2)}%)
              </li>
            )}
            {emotionData.face_emotion && (
              <li>
                <b>Face:</b> {emotionData.face_emotion} ({(emotionData.face_confidence * 100).toFixed(2)}%)
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
