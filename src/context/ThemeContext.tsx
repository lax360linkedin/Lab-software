import React, { createContext, useContext, useState, useEffect } from "react";

export const ACCENT_COLORS = [
  "#2563eb", // Royal Blue
  "#4f46e5", // Indigo
  "#7c3aed", // Purple
  "#db2777", // Pink
  "#dc2626", // Red
  "#ea580c", // Orange
  "#16a34a", // Green
  "#1e293b", // Slate Navy
  "#c59b27", // Gold
  "#0891b2", // Cyan / Teal
  "#0f172a", // Dark Slate / Black
  "#84a98c", // Sage Green
  "#581c87", // Deep Violet
  "#702459", // Plum / Berry (Default)
];

export const DEFAULT_ACCENT = "#020617";
export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80";

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  accentColor: DEFAULT_ACCENT,
  setAccentColor: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColorState] = useState<string>(() => {
    const saved = localStorage.getItem("dashboard_accent_color");
    if (saved === "#702459") {
      localStorage.removeItem("dashboard_accent_color");
      return DEFAULT_ACCENT;
    }
    return saved && saved.trim() ? saved : DEFAULT_ACCENT;
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--dashboard-accent", accentColor);
    localStorage.setItem("dashboard_accent_color", accentColor);
  }, [accentColor]);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    document.documentElement.style.setProperty("--dashboard-accent", color);
    localStorage.setItem("dashboard_accent_color", color);
  };

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
