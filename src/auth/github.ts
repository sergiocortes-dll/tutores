import { supabase } from "../supabase";

export async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github"
  })

  console.log(data);
  console.log(error);
}
