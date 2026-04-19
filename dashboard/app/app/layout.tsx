// dashboard/app/app/layout.tsx
// Auth guard + operator resolver.
// Server Component — runs on every /app/* request.
//
// SECURITY:
//   - Reads operator from operator_members, keyed on auth.uid().
//   - operator_id is NEVER trusted from the client — it comes from this server component.
//   - RLS enforces per-operator isolation at the DB layer.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, LayoutDashboard, Bot, Settings, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s — Axon Dashboard",
    default: "Dashboard — Axon",
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Check session.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // 2. Resolve operator from session user's memberships.
  //    We pick the first operator (by created_at) — multi-operator switching is a future feature.
  const { data: membership } = await supabase
    .from("operator_members")
    .select("operator_id, role, operators(id, name)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) {
    // Authenticated but no operator — show onboarding (future)
    redirect("/onboarding");
  }

  const operatorName =
    (membership.operators as unknown as { name: string } | null)?.name ?? "Unknown";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border flex flex-col">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-lg">Axon</span>
            <span className="text-muted-foreground text-xs font-mono">v0.1</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{operatorName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem href="/app" icon={LayoutDashboard} label="Dashboard" exact />
          <NavItem href="/app/agents" icon={Bot} label="Agents" />
          <NavItem href="/app/settings" icon={Settings} label="Settings" />
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground truncate mb-2">
            {session.user.email}
          </p>
          <form action="/api/auth/signout" method="POST">
            <button
              id="sidebar-signout"
              type="submit"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}
