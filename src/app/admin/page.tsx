import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const isAdmin = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user?.id)
    .eq("is_active", true)
    .single();
  if (!isAdmin) {
    console.log("not and admin, redirecting");
    redirect("/");
  }

  return (
    <div>
      <h1>Admin Page</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  );
}
