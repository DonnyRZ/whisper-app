# Indonesian Speech-to-Text Web App with Whisper

This project provides a web-based interface for transcribing Indonesian audio files using OpenAI's Whisper speech recognition model. The application allows users to record audio directly through their browser or upload existing audio files for transcription.

## System Requirements

- Python 3.9.9
- CUDA-capable GPU (recommended for faster processing)
- ffmpeg (for audio processing)
- At least 2GB VRAM for the "small" model (default)

## Running the Web Application

1. Navigate to the project directory:
   ```bash
   cd /home/data/workspace/KBI/testing-speech2text/test-whisper
   ```

2. Activate the existing virtual environment:
   ```bash
   source whisper-env-py399/bin/activate
   ```

3. Start the web server:
   ```bash
   python app.py
   ```

4. Access the application in your browser at:
   - Local access: http://localhost:5000
   - Network access: http://YOUR_COMPUTER_IP:5000
   (To find your IP address, run: `hostname -I`)

## Using the Web Interface

The web interface provides an easy-to-use platform for audio transcription:

1. Record audio directly through your browser using the "Start Recording" button
2. Upload existing audio files using the file upload option (appears if browser recording is not available)
3. Play back your recording with the "Play Recording" button
4. Transcribe audio with the "Transcribe" button
5. View transcription results with timing information

## Model Information

The application uses the "small" Whisper model by default, which provides an excellent balance of speed and accuracy for Indonesian transcription, processing audio at approximately 4x real-time speed.

## Performance Notes

- The first run will download the model weights and take longer
- Subsequent runs use cached models and work offline
- GPU processing is significantly faster than CPU processing
- Processing speed is measured relative to audio duration (e.g., 4x real-time means a 60-second audio file processes in about 15 seconds)