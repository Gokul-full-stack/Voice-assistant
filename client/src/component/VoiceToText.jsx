import React, { useState, useRef } from "react";
import { MdKeyboardVoice } from "react-icons/md";

function VoiceToText({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Speech Recognition not supported in this browser.");
      return;
    }

    if (!listening) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript.trim()) {
          onCommand(finalTranscript.trim());
          setTranscript("");
        }
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (err) => {
        console.error("SpeechRecognition error:", err);
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
      setListening(true);
    } else {
      recognitionRef.current?.stop();
      setListening(false);
      recognitionRef.current = null;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Mic button */}
      <button
        onClick={toggleListening}
        className={`p-1 rounded-full shadow-md transition-all duration-200 ${
          listening ? "bg-red-500 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
        title="Click to speak"
      >
        <MdKeyboardVoice size={20} />
      </button>

      {/* Show bubble ONLY while listening */}
      {listening && (
        <div className="px-3 py-2 bg-black text-white text-sm rounded-xl shadow-md">
          {transcript ? transcript : "How can I help you?"}
        </div>
      )}
    </div>
  );
}

export default VoiceToText;
