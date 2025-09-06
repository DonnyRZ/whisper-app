import whisper
import time
import argparse
import torch

def transcribe_audio(model_size, device, audio_file, language="id"):
    """
    Transcribe audio using Whisper with specified model size and device
    
    Args:
        model_size (str): Model size (tiny, base, small, medium, large, turbo)
        device (str): Device to use (cuda or cpu)
        audio_file (str): Path to audio file
        language (str): Language code (default: id for Indonesian)
    
    Returns:
        dict: Transcription result with timing information
    """
    
    # Validate device
    if device == "cuda" and not torch.cuda.is_available():
        print("CUDA not available, falling back to CPU")
        device = "cpu"
    
    print(f"Loading {model_size} model on {device}...")
    start_time = time.time()
    model = whisper.load_model(model_size, device=device)
    model_load_time = time.time() - start_time
    print(f"Model loaded in {model_load_time:.2f} seconds")
    
    # Transcribe the audio file
    print(f"\nTranscribing audio with {model_size} model...")
    start_time = time.time()
    result = model.transcribe(audio_file, language=language)
    transcription_time = time.time() - start_time
    
    # Calculate timing information
    audio_duration = result["segments"][-1]["end"] if result["segments"] else 0
    speed_ratio = audio_duration / transcription_time if audio_duration > 0 and transcription_time > 0 else 0
    
    # Prepare result with timing information
    result_with_timing = {
        "text": result["text"],
        "segments": result["segments"],
        "model_size": model_size,
        "device": device,
        "model_load_time": model_load_time,
        "transcription_time": transcription_time,
        "total_time": model_load_time + transcription_time,
        "audio_duration": audio_duration,
        "processing_speed": speed_ratio
    }
    
    return result_with_timing

def print_results(result):
    """Print transcription results and timing information"""
    
    print("Transcription:")
    print(result["text"])
    
    print("\nDetailed segments:")
    for segment in result["segments"]:
        print(f"[{segment['start']:.2f}s -> {segment['end']:.2f}s] {segment['text']}")
    
    print(f"\nTiming Information:")
    print(f"Model size: {result['model_size']}")
    print(f"Device used: {result['device']}")
    print(f"Model loading time: {result['model_load_time']:.2f} seconds")
    print(f"Transcription time: {result['transcription_time']:.2f} seconds")
    print(f"Total processing time: {result['total_time']:.2f} seconds")
    print(f"Audio duration: {result['audio_duration']:.2f} seconds")
    print(f"Processing speed: {result['processing_speed']:.2f}x real-time")

def main():
    parser = argparse.ArgumentParser(description="Transcribe audio with Whisper")
    parser.add_argument("--model", "-m", default="small", 
                        choices=["tiny", "tiny.en", "base", "base.en", "small", "small.en", "medium", "medium.en", "large", "turbo"],
                        help="Model size to use (default: small)")
    parser.add_argument("--device", "-d", default="cuda", 
                        choices=["cpu", "cuda"], 
                        help="Device to use (default: cuda)")
    parser.add_argument("--audio", "-a", default="test_audio/tes-audio.mp3",
                        help="Audio file to transcribe (default: test_audio/tes-audio.mp3)")
    parser.add_argument("--language", "-l", default="id",
                        help="Language code (default: id for Indonesian)")
    
    args = parser.parse_args()
    
    # Check available models
    print("Available models:")
    print("- tiny, tiny.en: ~1GB VRAM, ~10x speed")
    print("- base, base.en: ~1GB VRAM, ~7x speed")
    print("- small, small.en: ~2GB VRAM, ~4x speed")
    print("- medium, medium.en: ~5GB VRAM, ~2x speed")
    print("- large: ~10GB VRAM, 1x speed")
    print("- turbo: ~6GB VRAM, ~8x speed")
    print()
    
    try:
        result = transcribe_audio(args.model, args.device, args.audio, args.language)
        print_results(result)
    except Exception as e:
        print(f"Error during transcription: {e}")

if __name__ == "__main__":
    main()