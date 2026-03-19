import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Smartscheduling from "@/components/Smartscheduling";
import ProgressTracker from "@/components/ProgressTracker"
import PomodoroTimer from "@/components/PomodoroTimer";
import MockTest from "@/components/MockTest";
import ResourceSuggestion from "@/components/ResourceSuggestion";
import Team from "@/components/Team";
import Chatbot from "@/components/Chatbot";
// import TechStack from "@/components/TechStack";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Smartscheduling />
      <ProgressTracker />
      <PomodoroTimer />
      <MockTest />
      <ResourceSuggestion/>
      <Team />
      <Chatbot />
      
      {/* <TechStack /> */}
      <Footer />
    </div>
  );
};

export default Index;
