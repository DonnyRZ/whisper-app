import os
import sys
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import whisper
import time
import torch
import uuid

# Add the current directory to Python path to import flexible_transcribe
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the transcription function from our existing script
from flexible_transcribe import transcribe_audio

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key-here"
app.config["UPLOAD_FOLDER"] = "uploads"

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Load the Whisper model (small model as default)
model = None

def load_model(model_size="small", device="cuda"):
    """Load the Whisper model"""
    global model
    if model is None:
        if device == "cuda" and not torch.cuda.is_available():
            print("CUDA not available, falling back to CPU")
            device = "cpu"
        
        print(f"Loading {model_size} model on {device}...")
        model = whisper.load_model(model_size, device=device)
    return model

@app.route("/")
def index():
    """Serve the main page"""
    return render_template("index.html")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    """Handle audio file transcription"""
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "No audio file selected"}), 400
    
    # Generate unique filename
    filename = str(uuid.uuid4()) + ".wav"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    
    # Save the file
    file.save(filepath)
    
    try:
        # Load model if not already loaded
        load_model()
        
        # Transcribe the audio
        result = transcribe_audio("small", "cuda" if torch.cuda.is_available() else "cpu", filepath, "id")
        
        # Clean up the temporary file
        os.remove(filepath)
        
        return jsonify({
            "text": result["text"],
            "segments": result["segments"],
            "processing_time": result["total_time"],
            "speed_ratio": result["processing_speed"]
        })
    except Exception as e:
        # Clean up the temporary file in case of error
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500

@socketio.on("connect")
def handle_connect():
    """Handle client connection"""
    print("Client connected")
    emit("status", {"msg": "Connected to server"})

@socketio.on("disconnect")
def handle_disconnect():
    """Handle client disconnection"""
    print("Client disconnected")

if __name__ == "__main__":
    # Get the host IP to serve on local network
    host = "0.0.0.0"  # Listen on all interfaces
    port = 5000
    
    print(f"Starting server on {host}:{port}")
    print("Access the app from your mobile device using your laptop\"s IP address")
    socketio.run(app, host=host, port=port, debug=True, allow_unsafe_werkzeug=True)
