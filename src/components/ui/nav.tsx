"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-bold no-underline hover:no-underline text-[var(--text)]">
          🏠 App
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text)]">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text)]">
                Dashboard
              </Link>
              <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all duration-150 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] transition-all duration-150"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-xs px-3 py-1.5 rounded-md bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-all duration-150"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
