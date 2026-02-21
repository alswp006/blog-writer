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
    <section className="flex flex-col items-center text-center space-y-6 py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] max-w-3xl leading-tight">
        {headline}
      </h1>
      <p className="text-lg text-[var(--text-secondary)] max-w-xl">
        {subheadline}
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          href={ctaHref}
          className="px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-all duration-150"
        >
          {ctaText}
        </Link>
        {secondaryCtaText && secondaryCtaHref && (
          <Link
            href={secondaryCtaHref}
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm no-underline hover:bg-[var(--bg-card)] transition-all duration-150"
          >
            {secondaryCtaText}
          </Link>
        )}
      </div>
    </section>
  );
}
