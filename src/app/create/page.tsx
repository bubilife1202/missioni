"use client";

import { createClient } from "@/lib/supabase-browser";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import { VoiceInput } from "@/components/voice-input";
import { ChatMessage } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChild() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: children } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", user.id)
      .limit(1);

    if (!children || children.length === 0) {
      router.push("/onboarding");
      return;
    }

    const child = children[0];
    setChildId(child.id);
    setChildName(child.name);

    // AI 첫 인사
    sendToAI([], child.id);
  }

  async function sendToAI(currentMessages: ChatMessage[], cId?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          childId: cId || childId,
        }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message,
      };
      setMessages([...currentMessages, assistantMsg]);

      // HTML 코드 블록 추출
      const htmlMatch = data.message.match(/```html\n([\s\S]*?)\n```/);
      if (htmlMatch) {
        setPreviewHtml(htmlMatch[1]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    sendToAI(updated);
  }

  async function handleShare() {
    if (!previewHtml || !childId) return;

    const { data, error } = await supabase
      .from("creations")
      .insert({
        child_id: childId,
        title: "내가 만든 작품",
        html_content: previewHtml,
      })
      .select()
      .single();

    if (data) {
      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg text-slate-900">
          {childName ? `${childName}의 만들기` : "만들기"}
        </h1>
        <button
          onClick={() => router.push("/mission")}
          className="text-sm text-indigo-600 font-semibold hover:text-indigo-700"
        >
          미션으로 →
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 채팅 영역 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.map((msg, i) => (
              <ChatBubble
                key={i}
                message={{
                  ...msg,
                  content: msg.content
                    .replace(/```html\n[\s\S]*?\n```/, "⬇️ 아래에서 미리보기!")
                    .trim(),
                }}
              />
            ))}

            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-md text-sm text-slate-500">
                  만드는 중... ✨
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
            <div className="flex-1">
              <ChatInput
                onSend={handleSend}
                disabled={loading}
                placeholder="뭘 만들어볼까?"
              />
            </div>
            <VoiceInput onResult={handleSend} disabled={loading} />
          </div>
        </div>

        {/* 미리보기 영역 */}
        {previewHtml && (
          <div className="lg:w-1/2 border-l border-slate-200 bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-sm text-slate-900">미리보기</span>
              <button
                onClick={handleShare}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                {shareUrl ? "✅ 링크 복사됨!" : "친구한테 공유하기"}
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <iframe
                srcDoc={previewHtml}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
                title="미리보기"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
