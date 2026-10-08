import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useAuth } from "../../context/AuthContext.jsx"

function LoginForm() {
    const {login} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async(event) => {
        event.preventDefault()
        setError(null);
        try {
            await login (username, password);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Incorrect Username or Password')
            } else {
                setError('Something went wrong logging in, please try again shortly');
            }
        }
    };
    return (
        <Box sx={(theme) => ({
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background:
                theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #121212 0%, #1A2332 45%, #243447 100%)"
                    : "linear-gradient(135deg, #EAF4FA 0%, #DDECF7 45%, #C8DDF2 100%)"
        })}>
            <Paper component="form"
                onSubmit={handleSubmit}
                elevation={0}
                sx={{
                    p: 4,
                    width: 320,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    boxShadow: "0 10px 35px rgba(45, 80, 120, 0.15)",
                    transform: "translateY(-50px)"
            }}>
                <Typography variant="h6"sx={{textAlign: "center", fontWeight: 600, mb: 2}}>
                    MedFlow Login
                </Typography>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <TextField
                    label="Password"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <Button type="submit" variant="contained" fullWidth 
                sx={{
                    mt: 2,
                    bgcolor: "#5B8FD8",
                    "&:hover": {
                        bgcolor: "#4E7FC4"
                    }
                }}>
                    Log In
                </Button>
            </Paper>
        </Box>
    );
}
export default LoginForm;