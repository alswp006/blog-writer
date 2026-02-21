"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StyleProfile } from "@/lib/models/types";
import { MIN_TRAINING_TEXT_LEN } from "@/lib/models/limits";

interface TrainPasteCardProps {
  onSuccess: () => void;
}

export function TrainPasteCard({ onSuccess }: TrainPasteCardProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ styleProfile: StyleProfile } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/style-profile/train-paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.code || "Unknown error");
        return;
      }

      setResult(data);
      setText("");
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
        <CardTitle>Train from Paste</CardTitle>
        <CardDescription>
          Paste your writing samples (minimum {MIN_TRAINING_TEXT_LEN} characters)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste your writing samples here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
              required
              rows={10}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {text.length} / {MIN_TRAINING_TEXT_LEN} characters
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)] text-sm text-[var(--text)]">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Source Type:</span>
                <Badge variant="default">{result.styleProfile.sourceType}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Status:</span>
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
            {loading ? "Processing..." : "Train from Paste"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
