"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type ApiErrorShape = { code: string; message: string };

export function NewRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorShape | null>(null);
  const [topic, setTopic] = useState("");
  const [titleHint, setTitleHint] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [constraints, setConstraints] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/writing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          titleHint: titleHint.trim() || undefined,
          keyPoints: keyPoints.trim() || undefined,
          constraints: constraints.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
        );
        return;
      }

      router.push(`/requests/${data.writingRequest.id}`);
    } catch {
      setError({ code: "NETWORK_ERROR", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isStyleNotReady =
    error?.code === "CONFLICT" && error?.message === "STYLE_PROFILE_NOT_READY";

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Writing Request</CardTitle>
        <CardDescription>
          Generate a blog post draft in your personal writing style
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error?.code === "UNAUTHORIZED" && (
          <div className="mb-4 p-4 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)] space-y-3">
            <p className="text-sm font-medium text-[var(--text)]">
              Authentication Required
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              You need to be logged in to create a writing request.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm px-4 py-2 rounded-md bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-all duration-150"
            >
              Go to Login
            </Link>
          </div>
        )}

        {isStyleNotReady && (
          <div className="mb-4 p-4 rounded-md bg-[var(--warning-soft)] border border-[var(--warning)] space-y-3">
            <p className="text-sm font-medium text-[var(--text)]">
              Style Profile Not Ready
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              You need to train your style profile before generating content.
            </p>
            <Link
              href="/style"
              className="inline-block text-sm px-4 py-2 rounded-md bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-all duration-150"
            >
              Set Up Style Profile
            </Link>
          </div>
        )}

        {error && error.code !== "UNAUTHORIZED" && !isStyleNotReady && (
          <div className="mb-4 p-4 rounded-md bg-[var(--danger-soft)] border border-[var(--danger)]">
            <p className="text-sm text-[var(--text)]">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">
              Topic <span className="text-[var(--danger)]">*</span>
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should this post be about?"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">
              Title Hint{" "}
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (optional)
              </span>
            </label>
            <Input
              value={titleHint}
              onChange={(e) => setTitleHint(e.target.value)}
              placeholder="Suggested title or angle"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">
              Key Points{" "}
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="Key points to cover, one per line"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">
              Constraints{" "}
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Any specific constraints or requirements"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Draft"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
