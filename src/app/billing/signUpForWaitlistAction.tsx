"use server";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function signUpForWaitlist() {
  const supabase = await createClient();
  const user = await getUser();
  // const { toast } = useToast();

  if (!user) {
    console.log("User not found");
    return { status: "error", message: "User not found" };
  }
  // try to get display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      user_id: user.id,
      email: user.email,
      display_name: profile?.display_name,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // This is a unique constraint violation (entry already exists)
      return { status: "success", message: "You are already on the waitlist" };
    }

    // // insert into the waitlist
    // const { data, error } = await supabase
    //   .from("waitlist")
    //   .upsert(
    //     {
    //       user_id: user.id,
    //       email: user.email,
    //       display_name: profile?.display_name,
    //     },
    //     { onConflict: "user_id,email" },
    //   )
    //   .select()
    //   .single();
    // console.log("made request to waitlist");
    // console.log(error);
    // console.log(data);

    if (error) {
      return { status: "error", message: "Failed to sign up for waitlist" };
    }

    return {
      status: "success",
      message: "You have been added to the waitlist!",
    };
  }
}

export async function getIsOnWaitlist() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    console.log("User not found");
    // something went wrong, maybe show an error and as user to sign in?
    return false;
  }
  const { data } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", user.email)
    .single();

  return !!data;
}
