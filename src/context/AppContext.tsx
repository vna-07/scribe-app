"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ThembaMsg {
  role: "user" | "themba";
  text: string;
  refused?: boolean;
  provider?: string;
  sources?: string[];
  proposed_action?: {
    type: "create_task" | "draft_message" | "record_stock_count" | "none";
    title: string;
    description: string;
  };
}

interface AppContextType {
  businessId: string | null;
  setBusinessId: (id: string) => void;
  thembaOpen: boolean;
  setThembaOpen: (open: boolean) => void;
  history: ThembaMsg[];
  setHistory: React.Dispatch<React.SetStateAction<ThembaMsg[]>>;
  // Track which tab the user is currently viewing, so Themba can be context-aware
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [thembaOpen, setThembaOpen] = useState(false);
  const [history, setHistory] = useState<ThembaMsg[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <AppContext.Provider
      value={{
        businessId,
        setBusinessId,
        thembaOpen,
        setThembaOpen,
        history,
        setHistory,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}