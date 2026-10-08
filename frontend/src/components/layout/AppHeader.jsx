import { AppBar, Toolbar, Typography, Box, Button, IconButton } from "@mui/material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useColorMode } from "../../context/ColorModeContext.jsx";

function AppHeader({ username, role, onLogout }) {
    const { mode, toggleColorMode } = useColorMode();
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: "#5a8bd5",
                borderBottom: "1px solid rgba(255, 255, 255, 0)",
                fontFamily: '"Segoe UI", sans-serif'
            }}
        >
            <Toolbar sx={{ position: "relative" }}>

                <PrecisionManufacturingIcon sx={{ mr: 2 }} />

                <Typography
                    variant="h6"
                    sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontWeight: 600,
                        letterSpacing: "0.4px",
                        color: "white"
                    }}
                >
                    MedFlow Clinical Command
                </Typography>

                {username && (
                    <Box
                        sx={{
                            ml: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 2
                        }}
                    >
                        <Typography variant="body2">
                            {username} ({role})
                        </Typography>

                        <IconButton
                            color="inherit"
                            onClick={toggleColorMode}
                            aria-label={
                                mode === "dark"
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >
                            {mode === "dark"
                                ? <LightModeIcon />
                                : <DarkModeIcon />
                            }
                        </IconButton>

                        <Button
                            color="inherit"
                            onClick={onLogout}
                        >
                            Logout
                        </Button>
                    </Box>
                )}

            </Toolbar>
        </AppBar>
    );
}

export default AppHeader;