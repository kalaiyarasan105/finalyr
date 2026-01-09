import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { conversationAPI } from "../api/conversations";
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  margin-top: 20px;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
`;

const WebcamContainer = styled.div`
  margin-bottom: 20px;
`;

const InputContainer = styled.div`
  margin: 20px 0;
`;

const Input = styled.input`
  width: 300px;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  margin-left: 10px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #5a6fd8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResponseContainer = styled.div`
  margin-top: 30px;
  text-align: left;
  display: inline-block;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
`;

const LegacyInterface = () => {
  const webcamRef = useRef(null);
  const [userText, setUserText] = useState("");
  const [emotionData, setEmotionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureAndSend = async () => {
    if (!userText.trim() && !webcamRef.current) return;
    
    setLoading(true);
    const imageSrc = webcamRef.current?.getScreenshot();

    const formData = new FormData();
    if (imageSrc) {
      const blob = await (await fetch(imageSrc)).blob();
      formData.append("image", blob, "frame.jpg");
    }
    if (userText.trim() !== "") {
      formData.append("text", userText);
    }

    try {
      const response = await conversationAPI.predictMultimodal(formData);
      setEmotionData(response);
    } catch (err) {
      console.error("Error:", err);
      alert("Error processing request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Multimodal Emotion-Aware Chatbot</Title>

      <WebcamContainer>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={480}
          height={360}
          videoConstraints={{ facingMode: "user" }}
          style={{ borderRadius: "10px", border: "2px solid #ccc" }}
        />
      </WebcamContainer>

      <InputContainer>
        <Input
          type="text"
          placeholder="Type your message..."
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && captureAndSend()}
        />
        <Button onClick={captureAndSend} disabled={loading}>
          {loading ? 'Processing...' : 'Send'}
        </Button>
      </InputContainer>

      {emotionData && (
        <ResponseContainer>
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

          {emotionData.example_inputs && (
            <div>
              <h4>Example inputs for this emotion:</h4>
              <ul>
                {emotionData.example_inputs.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          )}
        </ResponseContainer>
      )}
    </Container>
  );
};

export default LegacyInterface;