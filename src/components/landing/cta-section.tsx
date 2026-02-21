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
    <section className="py-16">
      <div className="card p-10 text-center space-y-4 bg-[var(--accent-soft)] border-[var(--accent)]">
        <h2 className="text-2xl font-bold text-[var(--text)]">{heading}</h2>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {description}
          </p>
        )}
        <div className="pt-2">
          <Link
            href={ctaHref}
            className="inline-block px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-all duration-150"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
