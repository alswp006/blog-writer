import Link from "next/link";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function HeroSection({
  headline,
  subheadline,
  ctaText = "Get Started",
  ctaHref = "/signup",
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  return (
    <section className="relative flex flex-col items-center text-center min-h-[70vh] justify-center py-20 bg-gradient-to-b from-[var(--accent)]/5 to-transparent">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] max-w-3xl leading-tight tracking-tight">
        {headline}
      </h1>
      <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-xl">
        {subheadline}
      </p>
      <div className="flex gap-4 mt-8">
        <Link
          href={ctaHref}
          className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/25"
        >
          {ctaText}
        </Link>
        {secondaryCtaText && secondaryCtaHref && (
          <Link
            href={secondaryCtaHref}
            className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm no-underline hover:bg-[var(--bg-card)] transition-all"
          >
            {secondaryCtaText}
          </Link>
        )}
      </div>
    </section>
  );
}
