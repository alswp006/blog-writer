import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
        <p className="text-base text-[var(--text-secondary)]">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 hover:shadow-md transition-all duration-300">
        <h2 className="text-xl font-semibold mb-6">Your Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase w-20">Email</span>
            <span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase w-20">Name</span>
            <span className="text-sm text-[var(--text-secondary)]">{user.name || "—"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase w-20">Joined</span>
            <span className="text-sm text-[var(--text-secondary)]">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Placeholder for app-specific content */}
      <div className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-8">
        <p className="text-sm text-[var(--text-muted)] text-center">
          Add your app features here. This dashboard is protected — only logged-in users can see it.
        </p>
      </div>
    </div>
  );
}
