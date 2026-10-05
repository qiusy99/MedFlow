import { Typography, Box, Snackbar, Alert, Paper } from "@mui/material";
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
import Sidebar from "./components/layout/Sidebar";
import WorkOrderDataGrid from "./components/workorders/WorkOrderDataGrid";
import UserDataGrid from "./components/users/UserDataGrid";
import ServiceReportDataGrid from "./components/servicereports/ServiceReportDataGrid";


function Dashboard() {
    const {user, logout} = useAuth()
    const [notification, setNotification] = useState(null)
    const [selectedPage, setSelectedPage] = useState("dashboard")
    function renderPage() {
        switch (selectedPage) {
            case "hospitals":
                return <HospitalDataGrid onSuccess={setNotification} />;

            case "equipments":
                return <EquipmentDataGrid onSuccess={setNotification} />;

            case "workorders":
                return <WorkOrderDataGrid onSuccess={setNotification} />;

            case "users":
                return <UserDataGrid onSuccess={setNotification} />

            case "servicereports":
                return <ServiceReportDataGrid onSuccess={setNotification} />

            case "technicians":
                return <TechnicianDataGrid />;

            case "discrepancies":
                return <DiscrepancyDataGrid />;

            case "reliability":
                return <ReliabilityMetricsList />;

            case "reporting":
                return <ReportingLines />;

            case "maintenance":
                return <MaintenanceFlags />;

            default:
                return (
                    <>
                        <Typography
                            variant="h4"
                            sx={{ mb: 1 }}
                        >
                            Welcome to MedFlow
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Clinical Equipment Command Center
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{ mb: 2 }}
                        >
                            Analytics Overview
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    lg: "1fr 1fr"
                                },
                                gap: 3
                            }}
                        >
                            <Paper
                                elevation={2}
                                sx={{ p: 3 }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Co-Location Discrepancies
                                </Typography>

                                <DiscrepancyDataGrid />
                            </Paper>

                            <Paper
                                elevation={2}
                                sx={{ p: 3 }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Reliability Metrics
                                </Typography>

                                <ReliabilityMetricsList />
                            </Paper>

                            <Paper
                                elevation={2}
                                sx={{ p: 3 }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Reporting Lines
                                </Typography>

                                <ReportingLines />
                            </Paper>

                            <Paper
                                elevation={2}
                                sx={{ p: 3 }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Maintenance Flags
                                </Typography>

                                <MaintenanceFlags />
                            </Paper>
                        </Box>
                    </>
                );
        }
    }
    return (
    <>
        <AppHeader
            username={user?.sub}
            role={user?.role}
            onLogout={logout}
        />

        <Box sx={{ display: "flex" }}>
            <Sidebar
                selectedPage={selectedPage}
                onSelectPage={setSelectedPage}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    minWidth: 0
                }}
            >
                {renderPage()}
            </Box>
        </Box>

        <Snackbar
            open={Boolean(notification)}
            autoHideDuration={4000}
            onClose={() => setNotification(null)}>
            <Alert 
                severity="success"
                onClose={() => setNotification(null)}>
                {notification}
            </Alert>
        </Snackbar>
    </>);
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