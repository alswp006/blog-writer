"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StyleProfile, CrawlAttempt } from "@/lib/models/types";

interface TrainUrlCardProps {
  onSuccess: () => void;
}

export function TrainUrlCard({ onSuccess }: TrainUrlCardProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    styleProfile: StyleProfile;
    crawlAttempt: CrawlAttempt;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/style-profile/train-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.code || "Unknown error");
        return;
      }

      setResult(data);
      setUrl("");
      onSuccess();
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Train from URL</CardTitle>
        <CardDescription>
          Provide a URL to crawl and extract your writing style
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="https://example.com/your-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)] text-sm text-[var(--text)]">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Crawl Status:</span>
                <Badge variant={result.crawlAttempt.status === "success" ? "success" : "error"}>
                  {result.crawlAttempt.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Profile Status:</span>
                <Badge variant={result.styleProfile.status === "ready" ? "success" : result.styleProfile.status === "failed" ? "error" : "default"}>
                  {result.styleProfile.status}
                </Badge>
              </div>

              {result.styleProfile.styleSummary && (
                <div className="p-3 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Style Summary:</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {result.styleProfile.styleSummary}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : "Train from URL"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
