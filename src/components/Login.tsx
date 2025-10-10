import { useNavigate } from "react-router-dom";
import { signInWithGithub } from "../auth/github";
import { supabase } from "../supabase";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (provider: 'google' | 'github') => {
    if (provider === "github") {
      signInWithGithub();
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (!error) navigate('/dashboard');
  };

  return (
    <div>
      <button onClick={() => handleLogin('google')}>Login with google</button>
      <button onClick={() => handleLogin('github')}>Login with github</button>
    </div>
  )
}


export default Login;
