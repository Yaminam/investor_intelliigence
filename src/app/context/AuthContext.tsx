import { createContext, useContext, useState, ReactNode } from "react";

export type StartupProfile = {
  companyName: string;
  stage: string;
  sectors: string[];
  problem: string;
  raisingAmount: string;
  fundingType: string;
  geographies: string[];
};

export type AuthUser = {
  name: string;
  email: string;
  avatar: string; // initials
  profile: StartupProfile | null;
  onboardingComplete: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  completeOnboarding: (profile: StartupProfile) => void;
  skipOnboarding: () => void;
  updateProfile: (profile: StartupProfile) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("ii_user");
    return stored ? JSON.parse(stored) : null;
  });

  const saveUser = (u: AuthUser) => {
    setUser(u);
    sessionStorage.setItem("ii_user", JSON.stringify(u));
  };

  const login = async (email: string, _password: string) => {
    // Mock — replace with real auth call
    await new Promise((r) => setTimeout(r, 800));
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    saveUser({ name, email, avatar: initials, profile: null, onboardingComplete: false });
  };

  const loginWithGoogle = async () => {
    await new Promise((r) => setTimeout(r, 600));
    const email = "demo@startup.in";
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const avatar = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    saveUser({
      name,
      email,
      avatar,
      profile: null,
      onboardingComplete: false,
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("ii_user");
  };

  const completeOnboarding = (profile: StartupProfile) => {
    if (!user) return;
    saveUser({ ...user, profile, onboardingComplete: true });
  };

  const skipOnboarding = () => {
    if (!user) return;
    saveUser({ ...user, onboardingComplete: true });
  };

  const updateProfile = (profile: StartupProfile) => {
    if (!user) return;
    saveUser({ ...user, profile, onboardingComplete: true });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, logout, completeOnboarding, skipOnboarding, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
