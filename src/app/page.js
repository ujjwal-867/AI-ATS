import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import DashboardPreview from "@/components/home/DashboardPreview";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <DashboardPreview />
      <Testimonials />
    </>
  );
}