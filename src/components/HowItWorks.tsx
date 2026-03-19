import { ClipboardList, Settings, Cpu, Rocket } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Input Your Details",
    description: "Enter exam dates, subjects, weak topics, and your daily available study time.",
  },
  {
    icon: Settings,
    step: "02",
    title: "AI Analysis",
    description: "Our algorithm analyzes your inputs and prioritizes topics based on difficulty and deadlines.",
  },
  {
    icon: Cpu,
    step: "03",
    title: "Generate Schedule",
    description: "Receive a personalized daily study plan with revision timetables and break suggestions.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Track & Adapt",
    description: "Monitor progress, earn rewards, and let the system adapt your plan for optimal results.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {/* <span className="text-primary font-medium mb-4 block animate-fade-up">
            HOW IT WORKS
          </span> */}
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up delay-100">
            Four Simple Steps to{" "}
            <span className="gradient-text">Better Learning</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-up delay-200">
            Our intelligent system makes study planning effortless and effective.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative animate-fade-up"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                {/* Step Card */}
                <div className="glass-card p-6 rounded-xl text-center group hover:border-primary/50 transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm z-10">
                    {index + 1}
                  </div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 mt-4 group-hover:bg-primary/10 transition-colors">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
