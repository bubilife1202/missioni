"use client";

import { InterestTag } from "@/types";

const ALL_TAGS: { tag: InterestTag; emoji: string }[] = [
  { tag: "요리", emoji: "🍳" },
  { tag: "과학", emoji: "🔬" },
  { tag: "만들기", emoji: "✂️" },
  { tag: "그리기", emoji: "🎨" },
  { tag: "음악", emoji: "🎵" },
  { tag: "운동", emoji: "⚽" },
  { tag: "게임", emoji: "🎮" },
  { tag: "읽기", emoji: "📚" },
];

interface Props {
  selected: InterestTag[];
  onChange: (tags: InterestTag[]) => void;
}

export function InterestTags({ selected, onChange }: Props) {
  function toggle(tag: InterestTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {ALL_TAGS.map(({ tag, emoji }) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition-all ${
            selected.includes(tag)
              ? "border-amber-500 bg-amber-50 font-semibold"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-xl">{emoji}</span>
          <span>{tag}</span>
        </button>
      ))}
    </div>
  );
}
