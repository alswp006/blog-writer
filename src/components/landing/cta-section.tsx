import Link from "next/link";

interface CtaSectionProps {
  heading: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function CtaSection({
  heading,
  description,
  ctaText = "Get Started Free",
  ctaHref = "/signup",
}: CtaSectionProps) {
  return (
    <section className="py-20">
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--accent)]/10 to-[var(--bg-card)] p-12 md:p-16 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">{heading}</h2>
        {description && (
          <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            {description}
          </p>
        )}
        <div className="pt-4">
          <Link
            href={ctaHref}
            className="inline-block px-8 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/25"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
