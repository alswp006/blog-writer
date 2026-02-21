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
    <section className="space-y-10 py-12">
      {(heading || subheading) && (
        <div className="text-center space-y-3">
          {heading && (
            <h2 className="text-2xl font-bold text-[var(--text)]">{heading}</h2>
          )}
          {subheading && (
            <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
              {subheading}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="card p-6 space-y-3">
            <span className="text-2xl">{feature.icon}</span>
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
