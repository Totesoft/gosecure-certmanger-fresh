import { useTheme } from "./ThemeContext";

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    function handleChange(e) {
        setTheme(e.target.value);
    }

    return (
        <select
            value={theme}
            onChange={handleChange}
            className="
                px-3 py-2 rounded-lg text-lg font-extrabold
                bg-[var(--bg-card)]
                text-[var(--text-primary)]
                border border-[var(--border-color)]
                focus:outline-none
                focus:ring-2 focus:ring-[var(--accent-primary)]
                hover:bg-[var(--bg-hover)]
                transition
            "
        >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="blue">Blue</option>
            <option value="system">System</option>
        </select>
    );
}
