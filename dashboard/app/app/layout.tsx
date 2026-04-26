// dashboard/app/app/layout.tsx
// Auth guard + operator resolver + sidebar.
// Server Component — runs on every /app/* request.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, LayoutDashboard, Bot, Settings, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s — Intaglio Dashboard",
    default: "Dashboard — Intaglio",
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("operator_members")
    .select("operator_id, role, operators(id, name)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) {
    redirect("/onboarding");
  }

  const operatorName =
    (membership.operators as unknown as { name: string } | null)?.name ?? "Unknown";

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="ax-sidebar">
        {/* Brand */}
        <div className="ax-sidebar-brand">
          <div className="ax-sidebar-logo">
            <Shield className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="ax-sidebar-logo-text">Intaglio</span>
            <span className="ax-sidebar-version">v0.1</span>
          </div>
          <p className="ax-sidebar-operator">{operatorName}</p>
        </div>

        {/* Nav */}
        <nav className="ax-sidebar-nav">
          <Link href="/app" className="ax-sidebar-link ax-sidebar-link--active">
            <LayoutDashboard className="ax-sidebar-link-icon" />
            Dashboard
          </Link>
          <Link href="/app/agents" className="ax-sidebar-link">
            <Bot className="ax-sidebar-link-icon" />
            Agents
          </Link>
          <Link href="/app/settings" className="ax-sidebar-link">
            <Settings className="ax-sidebar-link-icon" />
            Settings
          </Link>
        </nav>

        {/* User */}
        <div className="ax-sidebar-footer">
          <p className="ax-sidebar-email">{session.user.email}</p>
          <form action="/api/auth/signout" method="POST">
            <button id="sidebar-signout" type="submit" className="ax-sidebar-signout">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
