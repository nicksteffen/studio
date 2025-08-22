import { createClient } from "@/lib/supabase/server";
import Button from "./button";

export default async function TestPage() {
  const supabase = await createClient();
  const { data: serverUser } = await supabase.auth.getUser();

  const id = serverUser?.user?.id ? serverUser.user.id : 1000;
  const { data, error } = await supabase.auth.getUser();

  return (
    <>
      <p> test page </p>
    </>
  );
}
