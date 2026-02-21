import { generateMetadata as seo } from "@/lib/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const metadata = seo({
  title: "Home",
  description: "Build something amazing. Get started today.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection
        headline="Build Something Amazing"
        subheadline="The fastest way to go from idea to production. Start building today with powerful tools and seamless integrations."
        ctaText="Get Started"
        ctaHref="/signup"
        secondaryCtaText="Login"
        secondaryCtaHref="/login"
      />

      <FeatureGrid
        heading="Everything You Need"
        subheading="Powerful features to help you build, launch, and scale."
        features={[
          {
            icon: "⚡",
            title: "Lightning Fast",
            description:
              "Optimized for speed with modern architecture and edge-ready deployment.",
          },
          {
            icon: "🔒",
            title: "Secure by Default",
            description:
              "Built-in authentication, session management, and security best practices.",
          },
          {
            icon: "📦",
            title: "Ready to Ship",
            description:
              "Pre-built components, payments, and analytics — everything you need to launch.",
          },
        ]}
      />

      <CtaSection
        heading="Ready to Get Started?"
        description="Join today and start building in minutes. No credit card required."
        ctaText="Create Your Account"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
