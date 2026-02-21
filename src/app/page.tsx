import { generateMetadata as seo } from "@/lib/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const metadata = seo({
  title: "홈",
  description: "URL에서 문체를 학습하거나 붙여넣고 당신의 목소리로 블로그 초안을 생성하세요.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="w-screen ml-[calc(50%-50vw)]">
      <HeroSection
        headline="당신의 목소리로 블로그를 쓰세요"
        subheadline="URL에서 문체를 학습하거나 직접 글을 붙여넣으세요. AI가 당신과 똑같이 쓰는 초안을 생성합니다."
        ctaText="문체 학습"
        ctaHref="/style"
        secondaryCtaText="초안 작성"
        secondaryCtaHref="/write"
      />

      <FeatureGrid
        heading="이용 방법"
        subheading="당신의 독특한 목소리와 톤에 맞는 블로그를 쓰는 세 가지 단계입니다."
        features={[
          {
            icon: "🔗",
            title: "URL로 학습",
            description:
              "공개된 글이나 블로그 포스트의 링크를 제공하세요. 저희가 자동으로 텍스트를 추출하고 당신의 글쓰기 방식을 학습합니다.",
          },
          {
            icon: "📋",
            title: "글 붙여넣기",
            description:
              "URL이 없으신가요? 이메일, 에세이, 이전 포스트 등 당신의 글을 직접 붙여넣어 문체를 학습시키세요.",
          },
          {
            icon: "✍️",
            title: "초안 생성",
            description:
              "주제를 입력하면 당신의 목소리로 작성된 완성된 초안을 받으실 수 있습니다. 자유롭게 수정하고 출판하세요.",
          },
        ]}
      />

      <CtaSection
        heading="나만의 문체로 글을 써볼 준비가 되셨나요?"
        description="단 몇 분 안에 당신의 문체 프로필을 만들 수 있습니다. 신용카드는 필요 없습니다."
        ctaText="시작하기"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
