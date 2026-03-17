"use client";

import { createClient } from "@/lib/supabase-browser";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import { MissionCard } from "@/components/mission-card";
import { ChatMessage, MissionStep } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface SuggestedMission {
  title: string;
  description: string;
  steps: MissionStep[];
}

export default function MissionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [missions, setMissions] = useState<SuggestedMission[]>([]);
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

    sendToAI([], child.id);
  }

  async function sendToAI(currentMessages: ChatMessage[], cId?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          childId: cId || childId,
          mode: "suggest",
        }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message,
      };
      setMessages([...currentMessages, assistantMsg]);

      const missionMatch = data.message.match(/```missions\n([\s\S]*?)\n```/);
      if (missionMatch) {
        try {
          const parsed = JSON.parse(missionMatch[1]);
          setMissions(parsed);
        } catch {
          // JSON 파싱 실패 시 무시
        }
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

  async function handleSelectMission(mission: SuggestedMission) {
    if (!childId) return;

    const steps = mission.steps.map((s) => ({ ...s, done: false }));

    const { data, error } = await supabase
      .from("missions")
      .insert({
        child_id: childId,
        title: mission.title,
        description: mission.description,
        steps,
        status: "in_progress",
      })
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return;
    }

    router.push(`/mission/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg text-slate-900">
          {childName ? `${childName}의 미션` : "미션"}
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-indigo-600 font-semibold hover:text-indigo-700"
        >
          부모 대시보드
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            message={{
              ...msg,
              content: msg.content
                .replace(/```missions\n[\s\S]*?\n```/, "")
                .trim(),
            }}
          />
        ))}

        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-md text-sm text-slate-500">
              생각 중...
            </div>
          </div>
        )}

        {missions.length > 0 && (
          <div className="space-y-3 mt-4">
            <p className="text-sm font-semibold text-slate-700">
              이번 주 미션을 골라봐!
            </p>
            {missions.map((m, i) => (
              <MissionCard
                key={i}
                title={m.title}
                description={m.description}
                onSelect={() => handleSelectMission(m)}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {missions.length === 0 && (
        <div className="p-4 bg-white border-t border-slate-200">
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      )}
    </div>
  );
}
