import { createContext, useEffect, useState, useContext } from "react";

const THEME_KEY = "tote-theme";

const ThemeContext = createContext({
    theme: "system",
    setTheme: (value: string) => { }
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("system");

    useEffect(() => {
        const saved = localStorage.getItem(THEME_KEY) || "system";
        setTheme(saved);
        applyTheme(saved);
    }, []);

    function applyTheme(mode) {
        const root = document.documentElement;

        if (mode === "light") {
            root.classList.remove("dark");
            root.classList.add("light");
        } else if (mode === "blue") {
            root.classList.remove("dark", "light");
            root.classList.add("blue");
        }
        else if (mode === "dark") {
            root.classList.remove("light");
            root.classList.add("dark");
        } else {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.toggle("dark", isDark);
            root.classList.toggle("light", !isDark);
        }



    }

    useEffect(() => {
        if (theme === "system") {
            const listener = window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
                applyTheme("system");
            });

            return () =>
                window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
        }


    }, [theme]);

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

export function useTheme() {
    return useContext(ThemeContext);
}