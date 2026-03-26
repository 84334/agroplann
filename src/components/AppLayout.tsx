import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Lightbulb, CalendarDays, BookOpen, Menu, X, Sprout,
  Calculator, LogIn, LogOut, User, Bot, Crown, Settings, Moon,
  Sun, ChevronRight, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/recommend", label: "Recommend", icon: Lightbulb },
  { path: "/timetable", label: "Timetable", icon: CalendarDays },
  { path: "/guide", label: "Crop Guide", icon: BookOpen },
  { path: "/predictions", label: "Predictions", icon: Calculator },
  { path: "/ai-chat", label: "AI Chat", icon: Bot, pro: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { isProUser } = useSubscription();

  const handleSignOut = async () => {
    await signOut();
    setSidebarOpen(false);
    navigate("/");
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              Agro<span className="text-primary">Plan</span>
            </span>
          </Link>

          {/* Desktop nav — pages only */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Profile avatar button — opens sidebar */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="relative flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              aria-label="Open profile menu"
            >
              {user ? (
                <>
                  <span className="text-xs font-bold">{initials}</span>
                  {isProUser && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent">
                      <Crown className="h-2 w-2 text-accent-foreground" />
                    </span>
                  )}
                </>
              ) : (
                <User className="h-4 w-4" />
              )}
            </button>

            {/* Mobile nav toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t bg-background p-4 space-y-1 animate-fade-in-up">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-80 max-w-[85vw] bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-display font-semibold text-sm">Account</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Profile section */}
          <div className="p-4 border-b">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-11 w-11 rounded-full bg-primary/10 text-primary shrink-0">
                  <span className="text-sm font-bold">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-2">
                <div className="flex items-center justify-center h-14 w-14 mx-auto rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Welcome to AgroPlan</p>
                  <p className="text-xs text-muted-foreground">Sign in to save your progress</p>
                </div>
                <button
                  onClick={() => { setSidebarOpen(false); navigate("/auth"); }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In / Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Plan section */}
          <div className="p-4 border-b space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Plan</p>
            <button
              onClick={() => { setSidebarOpen(false); navigate("/pricing"); }}
              className={`w-full flex items-center justify-between rounded-xl p-3 transition-colors ${
                isProUser
                  ? "bg-accent/10 border border-accent/30"
                  : "bg-muted/50 border border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${
                  isProUser ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Crown className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{isProUser ? "Pro Plan" : "Free Plan"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isProUser ? "All features unlocked" : "Upgrade to unlock more"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Settings section */}
          <div className="p-4 space-y-1 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Settings</p>

            <button
              onClick={() => {
                document.documentElement.classList.toggle("dark");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Sun className="h-4 w-4 text-muted-foreground dark:hidden" />
              <Moon className="h-4 w-4 text-muted-foreground hidden dark:block" />
              <span>Toggle Dark Mode</span>
            </button>

            <button
              onClick={() => { setSidebarOpen(false); navigate("/guide"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>Crop Encyclopedia</span>
            </button>

            <button
              onClick={() => { setSidebarOpen(false); navigate("/pricing"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Manage Subscription</span>
            </button>
          </div>

          {/* Sign out */}
          {user && (
            <div className="p-4 border-t">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 AgroPlan — Smart Crop Rotation & Farming Assistant
      </footer>
    </div>
  );
}
