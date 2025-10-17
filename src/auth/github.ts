import { supabase } from "../supabase";

export async function signInWithGithub(redirectTo?: string) {
  const options = redirectTo ? { options: { redirectTo } } : {};
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    ...options,
  });

  if (error) {
    alert("Ocurrió un error");
    console.log("GithubLoginError:", error);
  }

  console.log(data);
  console.log(error);

  return { data, error };
}
