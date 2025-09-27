from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoFeatureExtractor, AutoModelForImageClassification, AutoTokenizer, AutoModelForSequenceClassification
import torch
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# ----------------------
# Load Models
# ----------------------

# Text emotion model
TEXT_MODEL = "bhadresh-savani/distilbert-base-uncased-emotion"
text_tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL)
text_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL)
text_pipeline = pipeline("text-classification", model=text_model, tokenizer=text_tokenizer, top_k=None)

# Face emotion model
FER_MODEL = "trpakov/vit-face-expression"
face_extractor = AutoFeatureExtractor.from_pretrained(FER_MODEL)
face_model = AutoModelForImageClassification.from_pretrained(FER_MODEL)

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
face_model.to(device)
text_model.to(device)

print(f"Device set to use {device}")

# ----------------------
# Multimodal Prediction
# ----------------------
@app.route("/predict_multimodal", methods=["POST"])
def predict_multimodal():
    user_text = request.form.get("text", "")
    user_image = request.files.get("image", None)

    text_emotion, text_confidence = None, None
    face_emotion, face_confidence = None, None

    # --- Text emotion ---
    if user_text:
        text_results = text_pipeline(user_text)[0]  # list of dicts
        best = max(text_results, key=lambda x: x["score"])
        text_emotion = best["label"]
        text_confidence = float(best["score"])  # ensure JSON serializable

    # --- Face emotion ---
    if user_image:
        img_bytes = user_image.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        inputs = face_extractor(images=img, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = face_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)[0]
            pred_idx = probs.argmax().item()
            face_emotion = face_model.config.id2label[pred_idx]
            face_confidence = float(probs[pred_idx].item())  # safe cast

    # --- Bot response logic (simple rule-based for demo) ---
    bot_response = "I’m here to help!"
    if text_emotion == "sadness" or face_emotion == "sad":
        bot_response = "I'm sorry you're feeling down. Things will get better soon!"
    elif text_emotion == "joy" or face_emotion == "happy":
        bot_response = "That's wonderful! I'm really glad to hear that!"
    elif text_emotion == "anger" or face_emotion == "angry":
        bot_response = "I understand you're upset. Take a deep breath, it’ll be okay."

    return jsonify({
        "text_emotion": text_emotion,
        "text_confidence": float(text_confidence) if text_confidence is not None else None,
        "face_emotion": face_emotion,
        "face_confidence": float(face_confidence) if face_confidence is not None else None,
        "bot_response": bot_response
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
