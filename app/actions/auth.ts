"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import { createClient } from "@supabase/supabase-js"

const secretKey = process.env.FARM_PASSWORD || "default_unsafe_secret_key"
const key = new TextEncoder().encode(secretKey)

export async function login(userId: string, pass: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: "Database configuration missing" }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data, error } = await supabase
    .from("farm_users")
    .select("*")
    .eq("user_id", userId)
    .eq("password", pass)
    .maybeSingle()

  if (error) {
    console.error("Supabase Login Error:", error)
    return { success: false, error: "Database error occurred" }
  }

  if (data) {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const session = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(key)

    // Next.js 15+ requires awaiting cookies()
    const cookieStore = await cookies()
    cookieStore.set("farm_auth_session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return { success: true }
  }

  return { success: false, error: "Invalid User ID or Password" }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set("farm_auth_session", "", { expires: new Date(0) })
  return { success: true }
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("farm_auth_session")?.value
  if (!session) return null
  
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (err) {
    return null
  }
}
