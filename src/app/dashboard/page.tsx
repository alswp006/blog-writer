import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--text-muted)] w-16">Email</span>
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--text-muted)] w-16">Name</span>
            <span className="text-sm">{user.name || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--text-muted)] w-16">Joined</span>
            <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Placeholder for app-specific content */}
      <div className="card p-6 border-dashed">
        <p className="text-sm text-[var(--text-muted)] text-center">
          Add your app features here. This dashboard is protected — only logged-in users can see it.
        </p>
      </div>
    </div>
  );
}
