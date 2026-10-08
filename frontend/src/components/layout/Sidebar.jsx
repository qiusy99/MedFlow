import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BuildIcon from "@mui/icons-material/Build";
import { useAuth } from "../../context/AuthContext.jsx";


function Sidebar({ selectedPage, onSelectPage }) {
    const { user } = useAuth();
    const isAdmin = user?.role === "Clinical_Admin";

    const mainItems = [
        {
            label: "Dashboard",
            value: "dashboard",
            icon: <DashboardIcon />
        },
        {
            label: "Hospitals",
            value: "hospitals",
            icon: <LocalHospitalIcon />
        },
        {
            label: "Equipments",
            value: "equipments",
            icon: <MedicalServicesIcon />
        },
        {
            label: "Technicians",
            value: "technicians",
            icon: <EngineeringIcon />
        },
        {
            label: "Work Orders",
            value: "workorders",
            icon: <AssignmentIcon />
        },
        {
            label: "Users",
            value: "users",
            icon: <AssignmentIcon />,
            adminOnly: true
        },
        {
            label: "Service Reports",
            value: "servicereports",
            icon: <AssignmentIcon />
        }
    ];

    const analyticsItems = [
        {
            label: "Discrepancies",
            value: "discrepancies",
            icon: <WarningAmberIcon />
        },
        {
            label: "Reliability",
            value: "reliability",
            icon: <AnalyticsIcon />
        },
        {
            label: "Reporting Lines",
            value: "reporting",
            icon: <AccountTreeIcon />
        },
        {
            label: "Maintenance",
            value: "maintenance",
            icon: <BuildIcon />
        }
    ];

    const itemStyles = {
        mx: 1,
        my: 0.4,
        borderRadius: 2,

        "&.Mui-selected": {
            bgcolor: "action.selected",
            color: "primary.main"
        },

        "&.Mui-selected:hover": {
            bgcolor: "action.selected"
        },

        "&:hover": {
            bgcolor: "action.hover"
        }
    };

    return (
        <Box
            sx={{
                width: 240,
                minHeight: "calc(100vh - 64px)",
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "background.paper"
            }}
        >
            <List>
                {mainItems
                    .filter((item) => !item.adminOnly || isAdmin)
                    .map((item) => (
                        <ListItemButton
                            sx={itemStyles}
                            key={item.value}
                            selected={selectedPage === item.value}
                            onClick={() => onSelectPage(item.value)}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 38,
                                    color:
                                        selectedPage === item.value
                                            ? "primary.main"
                                            : "text.secondary"
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>

                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
            </List>

            <Divider />

            <Typography
                variant="overline"
                sx={{
                    display: "block",
                    px: 2.5,
                    pt: 2,
                    pb: 0.5,
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "1.2px"
                }}
            >
                ANALYTICS
            </Typography>

            <List>
                {analyticsItems.map((item) => (
                    <ListItemButton
                        sx={itemStyles}
                        key={item.value}
                        selected={selectedPage === item.value}
                        onClick={() => onSelectPage(item.value)}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 38,
                                color:
                                    selectedPage === item.value
                                        ? "primary.main"
                                        : "text.secondary"
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>

                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}

export default Sidebar;