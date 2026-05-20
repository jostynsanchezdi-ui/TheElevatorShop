import Header from "@/components/layout/Header";
import HeroSection from "@/components/layout/HeroSection";
import ProductsSection from "@/components/products/ProductsSection";
import RecommendationsSection from "@/components/products/RecommendationsSection";
import Footer from "@/components/layout/Footer";
import WelcomeModal from "@/components/layout/WelcomeModal";

export default function Home() {
  return (
    <>
      <WelcomeModal />
      <Header />
      <main className="flex-1">
        <div className="hidden lg:block">
          <HeroSection />
        </div>
        <ProductsSection />
        <RecommendationsSection />
      </main>
      <Footer />
    </>
  );
}
