// Re-export the useAuth hook from AuthContext for compatibility
export { useAuth } from '../contexts/AuthContext';

export const login = async (msnv: string, password: string) => {
  try {

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("MSNV", msnv)
      .single();

    if (error || !data) {
      return false
    }

    if (data.password !== password) {
      return false
    }

    localStorage.setItem("user", JSON.stringify(data))

    return true

  } catch (err) {
    console.error("Login error:", err)
    return false
  }
}