import { createTheme } from "@mui/material/styles";

export function createAppTheme(mode) {
  return createTheme({
    palette: {mode: mode,},
    typography: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
  });
}