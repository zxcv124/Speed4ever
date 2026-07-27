import { onLogin } from '../../supabase/auth';

const Login = () => {
  return (
    <div>
      <button className="button" onClick={() => onLogin()}><i className="fab fa-google"></i>Sign in with email</button>
    </div>
  )
}

export default Login;
