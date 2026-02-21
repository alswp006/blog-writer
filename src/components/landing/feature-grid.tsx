interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  heading?: string;
  subheading?: string;
  features: Feature[];
}

export function FeatureGrid({ heading, subheading, features }: FeatureGridProps) {
  return (
    <section className="py-20">
      {(heading || subheading) && (
        <div className="text-center space-y-3 mb-12">
          {heading && (
            <h2 className="text-3xl font-bold text-[var(--text)] tracking-tight">{heading}</h2>
          )}
          {subheading && (
            <p className="text-base text-[var(--text-secondary)] max-w-lg mx-auto">
              {subheading}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 hover:shadow-md hover:border-[var(--accent)]/30 transition-all duration-300 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3 bg-[var(--accent)]/10 text-2xl leading-none">
                {feature.icon}
              </div>
              <span className="text-5xl font-bold text-[var(--accent)]/20 leading-none">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {feature.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
