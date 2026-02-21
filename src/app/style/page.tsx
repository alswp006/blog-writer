"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrainUrlCard } from "@/components/style/TrainUrlCard";
import { TrainPasteCard } from "@/components/style/TrainPasteCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StyleProfile } from "@/lib/models/types";

export default function StylePage() {
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/style-profile");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("UNAUTHORIZED");
        } else {
          setError(data.error?.code || "Unknown error");
        }
        return;
      }

      setProfile(data.styleProfile);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Style Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 h-64 animate-pulse bg-[var(--bg-card)]" />
          <div className="card p-6 h-64 animate-pulse bg-[var(--bg-card)]" />
        </div>
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Style Profile</h1>
        </div>
        <div className="p-6 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)] text-center space-y-4">
          <div className="text-3xl">🔒</div>
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Authentication Required
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            You need to be logged in to access this page.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm px-4 py-2 rounded-md bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-all duration-150"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Style Profile</h1>
        </div>
        <div className="p-6 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)]">
          <p className="text-sm text-[var(--text)]">
            <strong>Error:</strong> {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Style Profile</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Train your writing style to generate personalized content
        </p>
      </div>

      {profile && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Current Status:</span>
                <Badge variant={profile.status === "ready" ? "success" : profile.status === "failed" ? "error" : "default"}>
                  {profile.status}
                </Badge>
              </div>

              {profile.sourceType && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">Source Type:</span>
                  <Badge variant="default">{profile.sourceType}</Badge>
                </div>
              )}

              {profile.styleSummary && (
                <div className="p-3 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Style Summary:</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {profile.styleSummary}
                  </p>
                </div>
              )}

              {profile.lastError && (
                <div className="p-3 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Last Error:</p>
                  <p className="text-sm text-[var(--text)]">{profile.lastError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrainUrlCard onSuccess={loadProfile} />
        <TrainPasteCard onSuccess={loadProfile} />
      </div>
    </div>
  );
}
