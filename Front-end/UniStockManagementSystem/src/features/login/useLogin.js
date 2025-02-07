import { useAuth } from "../../context/AuthContext";

const useLogin = () => {
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    return await login({ email, password });
  };

  return { handleLogin };
};

export default useLogin;
