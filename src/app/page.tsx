import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: children } = await supabase
    .from("children")
    .select("id")
    .limit(1);

  if (!children || children.length === 0) {
    redirect("/onboarding");
  }

  redirect("/mission");
}
