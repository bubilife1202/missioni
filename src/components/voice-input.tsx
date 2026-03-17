"use client";

import { useState, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onResult, disabled }: Props) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const W = window as any;
    const SpeechRecognition = W.SpeechRecognition || W.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("이 브라우저에서는 음성 인식이 안 돼요");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-purple-100 text-purple-600 hover:bg-purple-200"
      } disabled:opacity-50`}
    >
      {isListening ? "🎤 듣는 중..." : "🎤"}
    </button>
  );
}
