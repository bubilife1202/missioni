"use client";

import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "메시지를 입력해봐!"}
        disabled={disabled}
        className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50"
      >
        보내기
      </button>
    </form>
  );
}
