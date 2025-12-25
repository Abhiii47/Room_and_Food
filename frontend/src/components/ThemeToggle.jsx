// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-3 py-1 rounded-md border text-sm"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </div>
  );
}
