import { ArrowRight, Sparkles, Calendar, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Particles from "./Particles";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <Particles />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-glow delay-1000" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up delay-100">
            <span className="text-foreground">Adaptive Study</span>
            <br />
            <span className="gradient-text glow-text">Planning System</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up delay-200">
            An intelligent scheduling system that creates personalized study plans, 
            tracks your progress, and adapts to your learning needs for maximum exam readiness.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up delay-300">
           {/* <link href="/Features"> */}
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg pulse-glow group"
              
            >
              Explore Features
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              
            </Button>
            {/* </link> */}
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border/50 hover:bg-muted px-8 py-6 text-lg"
            >
              View Documentation
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up delay-400">
            <div className="flex items-center gap-2 px-4 py-2 glass-card">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Smart Scheduling</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-card">
              <Brain className="h-5 w-5 text-secondary" />
              <span className="text-sm text-foreground">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-card">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Personalized</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/3 left-10 hidden lg:block floating">
          <div className="glass-card p-4 rounded-xl">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-1/2 right-10 hidden lg:block floating delay-1000">
          <div className="glass-card p-4 rounded-xl">
            <Brain className="h-8 w-8 text-secondary" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
