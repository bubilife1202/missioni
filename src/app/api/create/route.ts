import { openai } from "@/lib/openai";
import { createClient } from "@/lib/supabase-server";
import { Child, ChatMessage } from "@/types";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `너는 초등학생과 함께 디지털 작품을 만드는 AI 친구야.

## 규칙
- 반말로 대화해. 친구처럼 편하게.
- 한 번에 2~3문장만. 짧게.
- 아이가 뭔가를 만들고 싶다고 하면, 함께 만들어줘.
- 만들 때 HTML/CSS/JavaScript로 작동하는 코드를 생성해.
- 코드는 반드시 \`\`\`html 블록 안에 넣어.
- 한 번에 완성하지 말고, 단계별로 만들어.
- 매 단계마다 "다음에 뭘 추가하고 싶어?" 물어봐.
- 가끔 교육적 질문을 해. "이거 왜 이렇게 되는지 알아?" 같은.
- 아이가 잘하면 구체적으로 칭찬해.

## 대화 흐름
1. 먼저 반갑게 인사하고 "오늘 뭘 만들어볼까?" 물어봐.
2. 아이가 대답하면 "좋아! 먼저 OO부터 만들자!" 하고 첫 버전을 만들어.
3. 매번 코드를 보여줄 때 미리보기가 가능하게 완전한 HTML 파일로 만들어.
4. 단계별로 기능을 추가하며, 아이의 선택을 반영해.
5. 완성되면 "와 대단해! 네가 만든 거야!" 하고 축하해.

## 코드 규칙
- 반드시 완전한 HTML 파일로 (<!DOCTYPE html>부터)
- 한글로 내용 작성
- 모바일에서도 보기 좋게 (viewport meta 포함)
- 색상을 밝고 귀엽게
- 인라인 CSS와 JavaScript 사용 (외부 파일 없이)
- 코드가 길어도 완전한 파일로 제공`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, childId } = (await req.json()) as {
    messages: ChatMessage[];
    childId: string;
  };

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const childInfo = child as unknown as Child;
  const systemWithChild = `${SYSTEM_PROMPT}\n\n아이 이름: ${childInfo.name}, 나이: ${childInfo.age}살, 관심사: ${childInfo.interests.join(", ")}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemWithChild },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  return NextResponse.json({ message: text });
}
