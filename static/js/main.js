document.addEventListener("DOMContentLoaded", function() {
    // DOM elements
    const recordButton = document.getElementById("recordButton");
    const playButton = document.getElementById("playButton");
    const transcribeButton = document.getElementById("transcribeButton");
    const timerDisplay = document.getElementById("timer");
    const statusDisplay = document.getElementById("status");
    const resultDisplay = document.getElementById("result");
    const processingTimeDisplay = document.getElementById("processingTime");
    
    // Audio variables
    let mediaRecorder;
    let audioChunks = [];
    let startTime;
    let timerInterval;
    
    // Initialize Socket.IO
    const socket = io();
    
    // Socket event listeners
    socket.on("connect", function() {
        statusDisplay.textContent = "Connected to server";
        statusDisplay.style.backgroundColor = "#d4edda";
        statusDisplay.style.color = "#155724";
    });
    
    socket.on("disconnect", function() {
        statusDisplay.textContent = "Disconnected from server";
        statusDisplay.style.backgroundColor = "#f8d7da";
        statusDisplay.style.color = "#721c24";
    });
    
    socket.on("status", function(data) {
        statusDisplay.textContent = data.msg;
    });
    
    // Function to initialize media recording
    function initializeMediaRecording() {
        // Check if media devices API is available
        if (!navigator.mediaDevices) {
            console.warn("MediaDevices API is not supported in this browser");
            showUploadFallback();
            return false;
        }
        
        // Check if we are in a secure context (HTTPS or localhost)
        if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
            console.warn("getUserMedia() requires a secure context (HTTPS or localhost)");
            showUploadFallback();
            return false;
        }
        
        // Request microphone access
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // Create media recorder
                mediaRecorder = new MediaRecorder(stream);
                
                // Event listeners for media recorder
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    // Enable play and transcribe buttons
                    playButton.disabled = false;
                    transcribeButton.disabled = false;
                };
                
                // Update status
                statusDisplay.textContent = "Microphone access granted. Ready to record.";
                statusDisplay.style.backgroundColor = "#d1ecf1";
                statusDisplay.style.color = "#0c5460";
                recordButton.disabled = false;
            })
            .catch(err => {
                console.error("Error accessing microphone:", err);
                statusDisplay.innerHTML = "Microphone access denied: " + err.message + "<br>Using file upload mode instead.";
                statusDisplay.style.backgroundColor = "#fff3cd";
                statusDisplay.style.color = "#856404";
                showUploadFallback();
            });
            
        return true;
    }
    
    // Function to show upload fallback
    function showUploadFallback() {
        statusDisplay.innerHTML = "Direct recording not available.<br><button id=\"uploadButton\">Upload Audio File</button>";
        recordButton.disabled = true;
        playButton.disabled = true;
        transcribeButton.disabled = true;
        
        // Add upload functionality
        setTimeout(() => {
            const uploadButton = document.getElementById("uploadButton");
            if (uploadButton) {
                uploadButton.addEventListener("click", () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "audio/*";
                    input.onchange = (event) => {
                        const file = event.target.files[0];
                        if (file) {
                            audioChunks = [file];
                            playButton.disabled = false;
                            transcribeButton.disabled = false;
                            statusDisplay.textContent = "Audio file uploaded. Ready to play or transcribe.";
                            statusDisplay.style.backgroundColor = "#d1ecf1";
                            statusDisplay.style.color = "#0c5460";
                        }
                    };
                    input.click();
                });
            }
        }, 100);
    }
    
    // Initialize media recording
    initializeMediaRecording();
    
    // Record button event listener
    if (recordButton) {
        recordButton.addEventListener("click", () => {
            // Check if mediaRecorder is initialized
            if (!mediaRecorder) {
                statusDisplay.textContent = "Recording not available. Please check browser compatibility.";
                statusDisplay.style.backgroundColor = "#f8d7da";
                statusDisplay.style.color = "#721c24";
                return;
            }
            
            if (recordButton.textContent === "Start Recording") {
                // Start recording
                audioChunks = [];
                mediaRecorder.start();
                
                // Update UI
                recordButton.textContent = "Stop Recording";
                recordButton.classList.add("recording");
                resultDisplay.textContent = "Recording...";
                playButton.disabled = true;
                transcribeButton.disabled = true;
                
                // Start timer
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 100);
            } else {
                // Stop recording
                mediaRecorder.stop();
                
                // Update UI
                recordButton.textContent = "Start Recording";
                recordButton.classList.remove("recording");
                
                // Stop timer
                clearInterval(timerInterval);
            }
        });
    }
    
    // Play button event listener
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (audioChunks.length === 0) {
                statusDisplay.textContent = "No audio available to play.";
                statusDisplay.style.backgroundColor = "#fff3cd";
                statusDisplay.style.color = "#856404";
                return;
            }
            
            // Check if we have a file or blob
            let audioBlob;
            if (audioChunks[0] instanceof File) {
                audioBlob = audioChunks[0];
            } else {
                audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            }
            
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        });
    }
    
    // Transcribe button event listener
    if (transcribeButton) {
        transcribeButton.addEventListener("click", () => {
            if (audioChunks.length === 0) {
                statusDisplay.textContent = "No audio available to transcribe.";
                statusDisplay.style.backgroundColor = "#fff3cd";
                statusDisplay.style.color = "#856404";
                return;
            }
            
            resultDisplay.textContent = "Transcribing...";
            processingTimeDisplay.textContent = "";
            
            // Create FormData object
            const formData = new FormData();
            let audioBlob;
            
            // Check if we have a file or blob
            if (audioChunks[0] instanceof File) {
                audioBlob = audioChunks[0];
            } else {
                audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            }
            
            formData.append("audio", audioBlob, "recording.wav");
            
            // Send request to server
            fetch("/transcribe", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultDisplay.textContent = "Error: " + data.error;
                    statusDisplay.textContent = "Transcription error occurred.";
                    statusDisplay.style.backgroundColor = "#f8d7da";
                    statusDisplay.style.color = "#721c24";
                } else {
                    resultDisplay.textContent = data.text;
                    processingTimeDisplay.textContent = 
                        "Processing time: " + data.processing_time.toFixed(2) + " seconds (" + 
                        data.speed_ratio.toFixed(2) + "x real-time)";
                    statusDisplay.textContent = "Transcription completed successfully.";
                    statusDisplay.style.backgroundColor = "#d4edda";
                    statusDisplay.style.color = "#155724";
                }
            })
            .catch(error => {
                console.error("Error:", error);
                resultDisplay.textContent = "Error: " + error.message;
                statusDisplay.textContent = "Network error occurred.";
                statusDisplay.style.backgroundColor = "#f8d7da";
                statusDisplay.style.color = "#721c24";
            });
        });
    }
    
    // Function to update timer display
    function updateTimer() {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerDisplay.textContent = 
            String(minutes).padStart(2, "0") + ":" + 
            String(displaySeconds).padStart(2, "0");
    }
});
