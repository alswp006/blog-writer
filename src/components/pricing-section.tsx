"use client";

import { useState } from "react";

export type Plan = {
  name: string;
  price: string;
  description?: string;
  features: string[];
  priceId: string;
  highlighted?: boolean;
};

interface PricingSectionProps {
  plans: Plan[];
}

const stripeEnabled = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function PricingSection({ plans }: PricingSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!stripeEnabled) return;
    setLoading(priceId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode: "subscription" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`card p-6 flex flex-col ${
            plan.highlighted
              ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
              : ""
          }`}
        >
          <h3 className="text-lg font-semibold text-[var(--text)]">
            {plan.name}
          </h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-[var(--text)]">
              {plan.price}
            </span>
            {plan.price !== "Free" && plan.price !== "Custom" && (
              <span className="text-sm text-[var(--text-muted)]">/month</span>
            )}
          </div>
          {plan.description && (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {plan.description}
            </p>
          )}
          <ul className="mt-4 space-y-2 flex-1">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
              >
                <span className="text-[var(--success)] mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {!stripeEnabled ? (
              <span className="block text-center text-sm text-[var(--text-muted)] py-2">
                Coming Soon
              </span>
            ) : plan.price === "Free" ? (
              <span className="block text-center text-sm text-[var(--text-muted)] py-2">
                Current Plan
              </span>
            ) : plan.price === "Custom" ? (
              <a
                href="mailto:sales@example.com"
                className="block text-center text-sm px-4 py-2 rounded-md border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] transition-all duration-150"
              >
                Contact Sales
              </a>
            ) : (
              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full text-sm px-4 py-2 rounded-md transition-all duration-150 cursor-pointer ${
                  plan.highlighted
                    ? "bg-[var(--accent)] text-white hover:opacity-90"
                    : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.priceId ? "Redirecting..." : "Get Started"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
