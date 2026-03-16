import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id);

  if (!children || children.length === 0) redirect("/onboarding");

  const child = children[0];

  const { data: missions } = await supabase
    .from("missions")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false });

  const completedCount = (missions || []).filter(
    (m: Record<string, unknown>) => m.status === "completed"
  ).length;
  const inProgressCount = (missions || []).filter(
    (m: Record<string, unknown>) => m.status === "in_progress"
  ).length;

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg">부모 대시보드</h1>
        <Link
          href="/mission"
          className="text-sm text-amber-600 font-semibold"
        >
          미션 화면 →
        </Link>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-xl p-4 border mb-4">
          <h2 className="font-bold text-lg">
            {child.name} ({child.age}살)
          </h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(child.interests as string[]).map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-green-600">
              {completedCount}
            </p>
            <p className="text-xs text-gray-500">완료한 미션</p>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-amber-600">
              {inProgressCount}
            </p>
            <p className="text-xs text-gray-500">진행 중</p>
          </div>
        </div>

        <h3 className="font-semibold mb-3">미션 기록</h3>
        <div className="space-y-3">
          {(missions || []).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              아직 미션이 없어요.
              <br />
              <Link href="/mission" className="text-amber-600 underline">
                첫 미션을 시작해보세요!
              </Link>
            </p>
          )}
          {(missions || []).map((mission: Record<string, unknown>) => {
            const steps = mission.steps as Array<{ done: boolean }>;
            const doneSteps = steps.filter((s) => s.done).length;
            return (
              <Link
                key={mission.id as string}
                href={`/mission/${mission.id}`}
                className="block bg-white rounded-xl p-4 border hover:border-amber-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">
                      {mission.title as string}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {doneSteps}/{steps.length} 단계 완료
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      mission.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {mission.status === "completed" ? "완료" : "진행 중"}
                  </span>
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{
                      width: `${(doneSteps / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
