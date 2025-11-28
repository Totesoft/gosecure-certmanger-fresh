import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const THEME_KEY = "tote-theme";

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("system");

    useEffect(() => {
        const saved = localStorage.getItem(THEME_KEY) || "system";
        setTheme(saved);
        applyTheme(saved);
    }, []);

    function applyTheme(mode) {
        const root = document.documentElement;

        // Remove all theme classes
        root.classList.remove("light", "dark", "blue");

        if (mode === "light") {
            root.classList.add("light");
        }
        else if (mode === "dark") {
            root.classList.add("dark");
        }
        else if (mode === "blue") {
            root.classList.add("blue");
        }
        else if (mode === "system") {
            const useDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.add(useDark ? "dark" : "light");
        }
    }

    function updateTheme(value) {
        setTheme(value);
        localStorage.setItem(THEME_KEY, value);
        applyTheme(value);
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
