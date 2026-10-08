import { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "../theme";

const ColorModeContext = createContext(null);

export function ColorModeProvider({ children }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [mode, setMode] = useState(() => {
    try {
      const storedMode = localStorage.getItem("medflowColorMode");

      if (storedMode === "light" || storedMode === "dark") {
        return storedMode;
      }
    } catch (error) {
      console.error("Unable to read color mode from localStorage:", error);
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  function toggleColorMode() {
    const newMode = mode === "light" ? "dark" : "light";

    setMode(newMode);

    try {
      localStorage.setItem("medflowColorMode", newMode);
    } catch (error) {
      console.error("Unable to save color mode to localStorage:", error);
    }
  }

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}