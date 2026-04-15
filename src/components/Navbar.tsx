"use client";

import { useState, useEffect } from "react";
import { Menu, X, BookOpen, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { API_URL, broadcastAuth } from "@/lib/api";

type User = {
  id: string;
  email: string;
  username: string;
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Scroll handler with passive listener for performance
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#scheduler", label: "AI Scheduler" },
    { href: "#progress", label: "Progress" },
    { href: "#mock-test", label: "Mock Test" },
    { href: "#team", label: "Team" },
  ];

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Smooth scroll to section
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  // AUTH HANDLER
  const handleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin
        ? { email, password }
        : { username, email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      // Both login & signup now return token
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        broadcastAuth(data.user); // Notify all components
        setOpen(false);
        setError("");
      }

      setEmail("");
      setPassword("");
      setUsername("");
    } catch {
      setError("Connection failed. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("smartSchedulerData");
    setUser(null);
    broadcastAuth(null); // Notify all components of logout
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAuth();
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-2 group"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <BookOpen className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl">
                Smart<span className="text-primary">Planner</span>
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-4">
              {!user ? (
                <Button
                  onClick={() => {
                    setOpen(true);
                    setError("");
                  }}
                  className="px-6 pulse-glow"
                >
                  Get Started
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 group">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                        {getInitial(user.username)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.username}
                      </span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                      <UserIcon size={14} /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-400 gap-2 focus:text-red-400"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 animate-fade-in">
            <div className="container mx-auto px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-border/50">
                {!user ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setOpen(true);
                      setIsMobileMenuOpen(false);
                      setError("");
                    }}
                  >
                    Get Started
                  </Button>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm">
                        {getInitial(user.username)}
                      </div>
                      <span className="text-sm font-medium">{user.username}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400">
                      <LogOut size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* AUTH MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm">
              {isLogin
                ? "Login to access your study planner"
                : "Join SmartPlanner to start studying smarter"}
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-2" onKeyDown={handleKeyDown}>
            {!isLogin && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Username</label>
                <Input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background"
                />
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
            </div>

            {error && (
              <p className={`text-sm text-center ${error.includes("created") ? "text-green-400" : "text-red-400"}`}>
                {error}
              </p>
            )}

            <Button className="w-full py-5 text-base font-semibold" onClick={handleAuth} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isLogin ? "Logging in..." : "Creating account..."}
                </span>
              ) : (
                isLogin ? "Login" : "Sign Up"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                className="ml-1 text-primary hover:underline font-medium"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
