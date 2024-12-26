import Footer from "@/components/landing/footer/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorksSection from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <HowItWorksSection />
        {/* Add more sections here as needed */}
      </main>
      
     <Footer />
    </div>
  );
}
