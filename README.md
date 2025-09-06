# Indonesian Speech-to-Text with Whisper

This project provides an optimized setup for transcribing Indonesian audio files using OpenAI's Whisper speech recognition model. It includes both a command-line interface and a web-based interface for easy use.

## System Requirements

- Python 3.9.9
- CUDA-capable GPU (recommended for faster processing)
- ffmpeg (for audio processing)
- At least 2GB VRAM for the "small" model (default)

## Setup Instructions

### 1. Install System Dependencies

```bash
# Install ffmpeg
sudo apt update && sudo apt install ffmpeg

# Install Python 3.9.9 using pyenv (if not already installed)
curl https://pyenv.run | bash
# Add pyenv to your shell configuration as instructed
pyenv install 3.9.9
pyenv local 3.9.9
```

### 2. Create Virtual Environment

```bash
cd /path/to/this/project
python -m venv whisper-env
source whisper-env/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Web Application Usage

This project includes a Flask-based web application for easy transcription:

1. Start the web server:
   ```bash
   python app.py
   ```

2. Access the application in your browser at:
   - Local access: http://localhost:5000
   - Network access: http://YOUR_IP_ADDRESS:5000

3. Use the web interface to:
   - Record audio directly through your browser
   - Upload existing audio files
   - Transcribe audio files with real-time feedback
   - View transcription results with timing information

## Command-Line Usage

### Basic Usage

To transcribe an Indonesian audio file with the default optimized settings:

```bash
python flexible_transcribe.py --audio /path/to/your/audio.mp3
```

### Advanced Usage

You can customize the model, device, and other parameters:

```bash
# Use a different model size
python flexible_transcribe.py --model small --audio /path/to/your/audio.mp3

# Force CPU processing (not recommended if you have GPU)
python flexible_transcribe.py --device cpu --audio /path/to/your/audio.mp3

# Specify a different language (default is Indonesian "id")
python flexible_transcribe.py --language en --audio /path/to/your/audio.mp3
```

## Available Models

Whisper offers several models with different trade-offs between speed and accuracy:

| Model Size | VRAM Required | Relative Speed | Accuracy | Notes |
|------------|---------------|----------------|----------|-------|
| tiny | ~1GB | ~10x | Low | **Not recommended for Indonesian** - produces significant transcription errors |
| base | ~1GB | ~7x | Good | Better than tiny but still has issues with Indonesian |
| small | ~2GB | ~4x | Better | **Default model** - provides excellent balance of speed and accuracy for Indonesian |
| medium | ~5GB | ~2x | High | Very accurate but slow and memory-intensive |
| large | ~10GB | 1x | Highest | Most accurate but very slow and requires significant memory |
| turbo | ~6GB | ~8x | High | Fast transcription but not recommended for translation tasks |

### Model Recommendations for Indonesian

Based on extensive testing with Indonesian audio content:

1. **small (default)** - **RECOMMENDED**
   - Provides excellent balance of speed and accuracy for Indonesian
   - Processes audio at ~4x real-time speed
   - Minimal transcription errors
   - Works well on most GPUs with 2GB+ VRAM

2. **tiny** - **NOT RECOMMENDED FOR INDOESIAN**
   - While fast, produces significant transcription errors for Indonesian
   - Example error: "berkacau kejaya" instead of "bekerja"
   - Only recommended for very rough transcriptions where speed is critical

3. **base** - **NOT RECOMMENDED**
   - Has issues with Indonesian transcription accuracy
   - Better than tiny but still produces errors

4. **medium, large** - For specialized needs
   - Higher accuracy but slower processing
   - Require more GPU memory
   - Only recommended if you need maximum accuracy and have sufficient hardware

## Performance Notes

- The first run of each model will download the model weights and take longer
- Subsequent runs use cached models and work offline
- GPU processing is significantly faster than CPU processing
- Processing speed is measured relative to audio duration (e.g., 4x real-time means a 60-second audio file processes in about 15 seconds)

## File Output

The script generates transcription results in the console. To save to a file, redirect the output:

```bash
python flexible_transcribe.py --audio /path/to/your/audio.mp3 > transcription.txt
```