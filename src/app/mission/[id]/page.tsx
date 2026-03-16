"use client";

import { createClient } from "@/lib/supabase-browser";
import { StepChecklist } from "@/components/step-checklist";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import { Mission, ChatMessage, MissionStep } from "@/types";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [mission, setMission] = useState<Mission | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [childId, setChildId] = useState<string>("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadMission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMission() {
    const { data } = await supabase
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setMission(data as unknown as Mission);
      setChildId(data.child_id);
    }
  }

  async function handleCompleteStep(stepNumber: number) {
    if (!mission) return;

    const updatedSteps = mission.steps.map((s) =>
      s.step === stepNumber ? { ...s, done: true } : s
    );

    const allDone = updatedSteps.every((s) => s.done);

    const { error } = await supabase
      .from("missions")
      .update({
        steps: updatedSteps,
        status: allDone ? "completed" : "in_progress",
        completed_at: allDone ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (!error) {
      setMission({
        ...mission,
        steps: updatedSteps,
        status: allDone ? "completed" : "in_progress",
      });
    }
  }

  async function handleSendHelp(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatLoading(true);

    const currentStep = mission?.steps.find((s) => !s.done);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          childId,
          mode: "help",
          missionTitle: mission?.title,
          currentStep: currentStep
            ? `${currentStep.step}단계: ${currentStep.title}`
            : "",
        }),
      });
      const data = await res.json();
      setChatMessages([
        ...updated,
        { role: "assistant", content: data.message },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  const allDone = mission.steps.every((s: MissionStep) => s.done);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-500"
        >
          ←
        </button>
        <div>
          <h1 className="font-bold">{mission.title}</h1>
          <p className="text-xs text-gray-500">{mission.description}</p>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <StepChecklist
          steps={mission.steps}
          onComplete={handleCompleteStep}
        />

        {allDone && (
          <div className="mt-6 p-6 bg-green-50 border-2 border-green-400 rounded-xl text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-bold text-green-700">미션 완료!</p>
            <p className="text-sm text-green-600 mt-1">정말 잘했어!</p>
            <button
              onClick={() => router.push("/mission")}
              className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold"
            >
              다음 미션 받기
            </button>
          </div>
        )}

        {!allDone && (
          <div className="mt-6">
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full py-3 border-2 border-amber-300 text-amber-600 rounded-xl font-semibold hover:bg-amber-50"
            >
              {showChat ? "도움 닫기" : "도움이 필요해! 💬"}
            </button>

            {showChat && (
              <div className="mt-4 bg-white rounded-xl border p-4">
                <div className="max-h-60 overflow-y-auto mb-3 space-y-1">
                  {chatMessages.map((msg, i) => (
                    <ChatBubble key={i} message={msg} />
                  ))}
                  {chatLoading && (
                    <div className="text-sm text-gray-400 px-4">
                      생각 중...
                    </div>
                  )}
                </div>
                <ChatInput
                  onSend={handleSendHelp}
                  disabled={chatLoading}
                  placeholder="뭐가 어려워?"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
