import { Database, Globe, Server, Code2, GitBranch, Layout } from "lucide-react";

const technologies = [
  {
    category: "Frontend",
    icon: Layout,
    items: ["HTML5", "CSS3", "JavaScript", "React"],
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    category: "Backend",
    icon: Server,
    items: ["Python", "Flask/Django", "Node.js"],
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    category: "Database",
    icon: Database,
    items: ["MySQL", "MongoDB"],
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    category: "Tools",
    icon: GitBranch,
    items: ["VS Code", "Git", "Browser DevTools"],
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

const TechStack = () => {
  return (
    <section id="tech" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-medium mb-4 block animate-fade-up">
            TECHNOLOGY
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-up delay-100">
            Built with Modern{" "}
            <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-up delay-200">
            Leveraging industry-standard tools and frameworks for a robust solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <div
              key={tech.category}
              className="glass-card p-6 rounded-xl group hover:scale-105 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-lg ${tech.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tech.icon className={`h-6 w-6 ${tech.color}`} />
              </div>
              
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                {tech.category}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {tech.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Requirements Info */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl animate-fade-up delay-700">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="h-6 w-6 text-primary" />
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Software Requirements
                </h3>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Windows / Linux OS</li>
                <li>• Python / JavaScript</li>
                <li>• MySQL / MongoDB Database</li>
                <li>• Modern Web Browser</li>
              </ul>
            </div>
            
            <div className="glass-card p-6 rounded-xl animate-fade-up delay-800">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-secondary" />
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Hardware Requirements
                </h3>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Computer or Laptop</li>
                <li>• Minimum 8 GB RAM</li>
                <li>• Stable Internet Connection</li>
                <li>• Standard Peripherals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
