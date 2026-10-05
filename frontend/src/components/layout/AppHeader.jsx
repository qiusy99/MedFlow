import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

function AppHeader({ username, role, onLogout }) {
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