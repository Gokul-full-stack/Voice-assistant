import React, { useState, useRef } from "react";

function VoiceAssistant({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      onCommand(transcript);
    };

    recognitionRef.current.start();
  };

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={startListening}
        className={`p-3 rounded-full ${
          isListening ? "bg-red-500" : "bg-green-500"
        } text-white`}
      >
        🎤 {isListening ? "Listening..." : "Start"}
      </button>
    </div>
  );
}

export default VoiceAssistant;
