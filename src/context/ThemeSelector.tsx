import { useTheme } from "./ThemeContext";

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    function handleChange(e) {
        setTheme(e.target.value);
    }

    return (
        <select value={theme} onChange={handleChange} className="border p-2 rounded" >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="blue">Blue</option>
            <option value="system">System</option>

        </select>
    );
}