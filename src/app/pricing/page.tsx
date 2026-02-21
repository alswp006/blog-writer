import { PricingSection } from "@/components/pricing-section";
import type { Plan } from "@/components/pricing-section";

const plans: Plan[] = [
  {
    name: "Free",
    price: "Free",
    description: "Get started with the basics",
    features: [
      "Basic features",
      "Community support",
      "1 project",
    ],
    priceId: "",
  },
  {
    name: "Pro",
    price: "$19",
    description: "For professionals who need more",
    features: [
      "All Free features",
      "Priority support",
      "Unlimited projects",
      "Advanced analytics",
    ],
    priceId: "price_pro_monthly",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      "All Pro features",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    priceId: "price_enterprise",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-[var(--text)]">Pricing</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose the plan that works for you
        </p>
      </div>
      <PricingSection plans={plans} />
    </div>
  );
}
