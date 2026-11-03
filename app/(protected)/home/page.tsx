import Header from "@/components/Header";
import Hero from "@/components/Hero";
import JobsCarousel from "@/components/JobsCarousel";
import CoursesCarousel from "@/components/CoursesCarousel";
import Recommendations from "@/components/Recommendations";
import Footer from "@/components/Footer";
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <JobsCarousel />
        <CoursesCarousel />
        <Recommendations />
      </main>
      <Footer />
    </div>
  );
}