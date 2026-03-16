import { openai } from "@/lib/openai";
import { getMissionChatPrompt, getMissionHelpPrompt } from "@/lib/prompts";
import { createClient } from "@/lib/supabase-server";
import { Child, ChatMessage } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, childId, mode, missionTitle, currentStep } =
    (await req.json()) as {
      messages: ChatMessage[];
      childId: string;
      mode: "suggest" | "help";
      missionTitle?: string;
      currentStep?: string;
    };

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const systemPrompt =
    mode === "suggest"
      ? getMissionChatPrompt(child as unknown as Child)
      : getMissionHelpPrompt(
          child as unknown as Child,
          missionTitle || "",
          currentStep || ""
        );

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  return NextResponse.json({ message: text });
}
