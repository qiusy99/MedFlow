import { Container, Typography, Box, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import LoginForm from "./components/auth/LoginForm";
import AppHeader from "./components/layout/AppHeader";
import EquipmentDataGrid from "./components/equipments/EquipmentDataGrid";
import DiscrepancyDataGrid from "./components/workorders/DiscrepancyDataGrid";
import ReliabilityMetricsList from "./components/workorders/ReliabilityMetricsList";
import HospitalDataGrid from "./components/hospitals/HospitalDataGrid";
import TechnicianDataGrid from "./components/technicians/TechnicianDataGrid";
import ReportingLines from "./components/technicians/ReportingLines";
import MaintenanceFlags from "./components/hospitals/MaintenanceFlags";
import { AuthProvider, useAuth } from "./context/AuthContext";

function Dashboard() {
    const {user, logout} = useAuth()
    const [notification, setNotification] = useState(null)
    return (
        <>
        <AppHeader username={user?.sub} role={user?.role} onLogout={logout}/>
        <Container maxWidth='lg' sx={{mt:4}}>
            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Hospitals
            </Typography>
            <Box sx={{mb:4}}>
                <HospitalDataGrid/>
            </Box>

            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Equipments
            </Typography>
            <Box sx={{mb:4}}>
                <EquipmentDataGrid onSuccess={setNotification}/>
            </Box>

            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Technicians
            </Typography>
            <Box sx={{mb:4}}>
                <TechnicianDataGrid/>
            </Box>

            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Co-Location Discrepancies
            </Typography>
            <Box sx={{mb:4}}>
                <DiscrepancyDataGrid/>
            </Box>

            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Reliability Metrics
            </Typography>
            <Box sx={{mb:4}}>
                <ReliabilityMetricsList/>
            </Box>

            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Reporting Lines
            </Typography>
            <Box sx={{mb:4}}>
                <ReportingLines/>
            </Box>

            <Typography sx={{color: 'black'}} variant="h5" component="h2" gutterBottom>
                Maintenance Flags
            </Typography>
            <Box sx={{mb:4}}>
                <MaintenanceFlags/>
            </Box>
        </Container>
        <Snackbar
            open={Boolean(notification)}
            autoHideDuration={4000}
            onClose={() => setNotification(null)}>
                <Alert severity="success" onClose={() => setNotification(null)}>
                    {notification}
                </Alert>    
        </Snackbar>
        </>
    );
}

function AppContent() {
    const {isAuthenticated} = useAuth();
    return isAuthenticated ? <Dashboard/>:<LoginForm/>
}

function App(){
    return(
        <AuthProvider>
            <AppContent/>
        </AuthProvider>
    );
}
export default App;