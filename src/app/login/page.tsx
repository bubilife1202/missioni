"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">missioni</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          아이의 호기심을 프로젝트로 만들어요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "..." : isSignUp ? "가입하기" : "로그인"}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          {isSignUp ? "이미 계정이 있어요" : "처음이에요, 가입할래요"}
        </button>
      </div>
    </div>
  );
}
