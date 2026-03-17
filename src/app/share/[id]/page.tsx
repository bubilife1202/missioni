import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: creation } = await supabase
    .from("creations")
    .select("*, children(name)")
    .eq("id", id)
    .single();

  if (!creation) notFound();

  const childName = (creation.children as { name: string } | null)?.name || "아이";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-amber-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 text-center">
        <h1 className="font-bold text-lg">
          {childName}가 만든 작품!
        </h1>
        <p className="text-xs text-gray-500">missioni에서 AI와 함께 만들었어요</p>
      </div>
      <div className="flex-1">
        <iframe
          srcDoc={creation.html_content}
          sandbox="allow-scripts"
          className="w-full h-full border-0 min-h-[calc(100vh-64px)]"
          title="작품"
        />
      </div>
    </div>
  );
}
