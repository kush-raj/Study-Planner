"use client";

import {
  Calendar,
  Brain,
  Timer,
  Trophy,
  TrendingUp,
  Youtube,
  Target,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Generates daily study plans based on exam dates, priorities, and available time.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "#Smartscheduling",
  },
  {
    icon: Brain,
    title: "AI Topic Prioritization",
    description:
      "Dynamically prioritizes topics based on difficulty and confidence levels.",
    gradient: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
    href: "#ai-prioritization",
  },
  {
    icon: Timer,
    title: "Pomodoro Timer",
    description:
      "Built-in focus timer with customizable study and break intervals.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "#pomodoro",
  },
  {
    icon: Trophy,
    title: "Study Streaks",
    description:
      "Earn rewards for consistent study habits and maintain motivation.",
    gradient: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
    href: "#study-streaks",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track weekly progress and study consistency with visual analytics.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "#progress-tracking",
  },
  {
    icon: Target,
    title: "Mock Test",
    description:
      "Monitor your confidence on different topics to identify weak areas.",
    gradient: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
    href: "#confidence-tracking",
  },
  {
    icon: BarChart3,
    title: "Exam Readiness",
    description:
      "Predicts how prepared you are for exams based on study patterns.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "#exam-readiness",
  },
  {
    icon: Youtube,
    title: "Resource Suggestions",
    description:
      "Get YouTube learning resource recommendations for each topic.",
    gradient: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
    href: "#resources",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* FEATURES GRID */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold">
              Everything You Need for{" "}
              <span className="text-primary">Smarter Learning</span>
            </h2>
            <p className="text-muted-foreground mt-4">
              Click any feature to explore more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <a
                key={feature.title}
                href={feature.href}
                className="group cursor-pointer"
              >
                <div className="glass-card p-6 rounded-xl h-full hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <feature.icon
                      className={`h-6 w-6 ${feature.iconColor}`}
                    />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SECTIONS */}
      {/* <FeatureSection
        id="Smartscheduling"
        title="Smart Scheduling"
        text="Automatically creates daily study plans tailored to your exams and availability."
      /> */}

      {/* <FeatureSection
        id="ai-prioritization"
        title="AI Topic Prioritization"
        text="AI analyzes your weak and strong topics and adjusts priorities dynamically."
      /> */}

      {/* <FeatureSection
        id="pomodoro"
        title="Pomodoro Timer"
        text="Stay focused using proven Pomodoro techniques with breaks."
    
      /> */}

      {/* <FeatureSection
        id="study-streaks"
        title="Study Streaks"
        text="Build consistency by maintaining daily study streaks."
      /> */}

      {/* <FeatureSection
        id="progress-tracking"
        title="Progress Tracking"
        text="Visual insights into your weekly and monthly progress."
      /> */}

      {/* <FeatureSection
        id="Mock Test"
        title="Mock Test"
        text="Track confidence levels per subject and topic."
      /> */}

      {/* <FeatureSection
        id="exam-readiness"
        title="Exam Readiness"
        text="Predict exam readiness using your study behavior."
      /> */}

      {/* <FeatureSection
        id="resources"
        title="Resource Suggestions"
        text="Recommended YouTube videos and learning materials."
      /> */}
    </>
  );
}

/* REUSABLE SECTION COMPONENT */
function FeatureSection({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string;
}) {
  return (
    <section
      id={id}
      className="py-24 border-t border-border scroll-mt-24"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {text}
        </p>
      </div>
    </section>
  );
}
