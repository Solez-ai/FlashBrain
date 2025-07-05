import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
  currentCategory: number | null;
  currentFolder: number | null;
  studyMode: "manual" | "auto";
  autoPlayInterval: number;
}

interface AppStateContextType {
  state: AppState;
  setState: (state: Partial<AppState>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<AppState>({
    currentCategory: null,
    currentFolder: null,
    studyMode: "manual",
    autoPlayInterval: 5
  });

  const setState = (newState: Partial<AppState>) => {
    setStateInternal(prev => ({ ...prev, ...newState }));
  };

  return (
    <AppStateContext.Provider value={{ state, setState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}