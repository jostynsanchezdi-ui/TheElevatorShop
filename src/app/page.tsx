import Header from "@/components/layout/Header";
import HeroSection from "@/components/layout/HeroSection";
import ProductsSection from "@/components/products/ProductsSection";
import RecommendationsSection from "@/components/products/RecommendationsSection";
import CTASection from "@/components/layout/CTASection";
import Footer from "@/components/layout/Footer";
import WelcomeModal from "@/components/layout/WelcomeModal";

export default function Home() {
  return (
    <>
      <WelcomeModal />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProductsSection />
        <RecommendationsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
