import { BookOpen, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Smart<span className="text-primary">Planner</span>
            </span>
          </a>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span> © 2025 Smart Planner Inc. All right reserved</span>
            {/* <Heart className="h-4 w-4 text-destructive fill-destructive" />
            <span>by Md. Moin Khan & Raj Kushwaha</span> */}
          </div>

          {/* University Info */}
          <div className="text-center md:text-right">
            {/* <p className="text-muted-foreground text-sm">
              Sharda University, Greater Noida
            </p>
            <p className="text-muted-foreground/60 text-xs">
              MCA Project Synopsis • Dec 2025
            </p> */}
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-muted-foreground/60 text-xs">
            An intelligent scheduling system  that creates personalized study plans, 
            tracks your progress, and adapts to your learning needs for maximum exam readiness.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
