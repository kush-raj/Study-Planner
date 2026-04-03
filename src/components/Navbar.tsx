"use client";

import { useState, useEffect } from "react";
import { Menu, X, BookOpen } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";

type User = {
  id: string;
  email: string;
  username: string;
};

const API_URL = "https://study-planner-4-geb9.onrender.com";

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

  // Load user on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#team", label: "Team" },
    { href: "#tech", label: "Tech Stack" },
  ];

  const getInitial = (email: string) => email.charAt(0).toUpperCase();

  // 🔐 LOGIN / SIGNUP HANDLER
  const handleAuth = async () => {
    setError("");

    try {
      const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/signup";

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
        return;
      }

      // LOGIN returns token, SIGNUP does not
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setOpen(false);
      } else {
        // After signup → switch to login
        setIsLogin(true);
        setError("Account created. Please login.");
      }

      setEmail("");
      setPassword("");
      setUsername("");
    } catch {
      setError("No User Found !!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${
          isScrolled
            ? "bg-background/80 backdrop-blur border-b"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <a href="#" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">
                Smart<span className="text-primary">Planner</span>
              </span>
            </a>

            <div className="hidden lg:flex gap-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {!user ? (
                <Button onClick={() => setOpen(true)}>Get Started</Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center">
                        {getInitial(user.email)}
                      </div>
                      <span className="text-sm">{user.username}</span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={handleLogout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* AUTH MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              {isLogin ? "Login" : "Create Account"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button className="w-full" onClick={handleAuth}>
              {isLogin ? "Login" : "Sign Up"}
            </Button>

            <p className="text-center text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span
                className="ml-1 text-primary cursor-pointer"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
