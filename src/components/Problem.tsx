import { AlertTriangle, Clock, Target, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Poor Time Management",
    description: "Students struggle to allocate study time effectively across multiple subjects.",
  },
  {
    icon: Target,
    title: "Lack of Prioritization",
    description: "Most study plans fail to prioritize topics based on difficulty and importance.",
  },
  {
    icon: TrendingDown,
    title: "Ineffective Revision",
    description: "Static timetables don't adapt to individual learning needs and exam schedules.",
  },
  {
    icon: AlertTriangle,
    title: "Increased Stress",
    description: "Poor planning leads to last-minute cramming and higher anxiety levels.",
  },
];

const Problem = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {/* <span className="text-primary font-medium mb-4 block animate-fade-up">
            THE PROBLEM
          </span> */}
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up delay-100">
             Students Struggle with{" "}
            <span className="gradient-text">Study Planning</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-up delay-200">
            Traditional study methods fail to adapt to individual needs, leading to 
            inefficient preparation and lower academic performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="glass-card p-6 rounded-xl group hover:border-destructive/50 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
