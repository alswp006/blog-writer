import { generateMetadata as seo } from "@/lib/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const metadata = seo({
  title: "Home",
  description: "Train your writing style from a URL or paste, then generate blog drafts that sound like you.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection
        headline="Write Blog Posts in Your Voice"
        subheadline="Train your style from a URL or paste your own writing. Generate polished drafts that sound exactly like you."
        ctaText="Train Your Style"
        ctaHref="/style"
        secondaryCtaText="Write a Draft"
        secondaryCtaHref="/write"
      />

      <FeatureGrid
        heading="How It Works"
        subheading="Three steps to blog posts that match your unique voice and tone."
        features={[
          {
            icon: "🔗",
            title: "Train from URL",
            description:
              "Point to any published article or blog post. We extract the text and learn your writing patterns automatically.",
          },
          {
            icon: "📋",
            title: "Paste Your Writing",
            description:
              "No URL? Paste in any sample of your writing — emails, essays, or previous posts — to capture your style.",
          },
          {
            icon: "✍️",
            title: "Generate Drafts",
            description:
              "Enter a topic and get a full draft written in your voice. Edit, refine, and publish with confidence.",
          },
        ]}
      />

      <CtaSection
        heading="Ready to Write in Your Voice?"
        description="Train your style profile in minutes. No credit card required."
        ctaText="Get Started"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
