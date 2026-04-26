// dashboard/app/api/auth/signout/route.ts
// POST /api/auth/signout — sign out and redirect to home.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000"));
}
