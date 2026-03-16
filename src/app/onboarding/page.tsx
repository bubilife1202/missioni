"use client";

import { createClient } from "@/lib/supabase-browser";
import { InterestTags } from "@/components/interest-tags";
import { InterestTag } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState<InterestTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (interests.length === 0) {
      setError("관심사를 1개 이상 선택해주세요");
      return;
    }
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name,
      age: parseInt(age),
      interests,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/mission");
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-sm mx-auto pt-12">
        <h1 className="text-2xl font-bold mb-2">아이 등록하기</h1>
        <p className="text-gray-500 mb-8 text-sm">
          아이의 정보를 알려주세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="아이 이름"
              required
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">나이</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="만 나이"
              min={1}
              max={18}
              required
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              관심사 (여러 개 선택 가능)
            </label>
            <InterestTags selected={interests} onChange={setInterests} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "시작하기!"}
          </button>
        </form>
      </div>
    </div>
  );
}
