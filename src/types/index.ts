export type InterestTag =
  | "요리"
  | "과학"
  | "만들기"
  | "그리기"
  | "음악"
  | "운동"
  | "게임"
  | "읽기";

export interface Profile {
  id: string;
  email: string;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  interests: InterestTag[];
  created_at: string;
}

export interface MissionStep {
  step: number;
  title: string;
  description: string;
  done: boolean;
}

export type MissionStatus = "suggested" | "in_progress" | "completed";

export interface Mission {
  id: string;
  child_id: string;
  title: string;
  description: string;
  steps: MissionStep[];
  status: MissionStatus;
  result_photo: string | null;
  result_memo: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  child_id: string;
  mission_id: string | null;
  messages: ChatMessage[];
  created_at: string;
}
