import { supabase } from "../lib/supabase"

// Re-export hook từ AuthContext
export { useAuth } from "../contexts/AuthContext"

export const login = async (msnv: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("msnv", msnv)
      .single()

    console.log("DATA:", data)
    console.log("ERROR:", error)

    if (error || !data) {
      console.log("User not found")
      return false
    }

    if (data.password !== password) {
      console.log("Wrong password")
      return false
    }

    localStorage.setItem("sessionUser", JSON.stringify(data))

    return true
  } catch (err) {
    console.error("Login error:", err)
    return false
  }
}