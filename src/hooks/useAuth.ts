// Re-export the useAuth hook from AuthContext for compatibility
export { useAuth } from '../contexts/AuthContext';
const login = async (msnv: string, password: string) => {

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("MSNV", msnv)
    .eq("password", password)
    .single();

  if (error || !data) {
    return false;
  }

  localStorage.setItem("user", JSON.stringify(data))
  return true
}