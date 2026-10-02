import { Grid, Card, CardContent, Alert, CircularProgress, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import apiClient from "../../api/client";


function MaintenanceFlags() {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchFlags() {
        setLoading(true);
        try {
            const response = await apiClient.get(
                "/maintenanceflag"
            );
            setFlags(response.data);
            setError(null);
        } catch {
            setError("Could not load maintenance flags")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFlags();
    }, []);

    if (loading) return <CircularProgress/>
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Grid container spacing={2}>
            {flags.map((flag) => (
                <Grid key={flag.hospital_id}>
                    <Card variant="outlined" sx={{ width: 280 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {flag.hospital_name}
                            </Typography>

                            <Typography>
                                Total Equipment: {flag.total_equipment}
                            </Typography>

                            <Typography>
                                Maintenance Equipment: {flag.maintenance_equipment}
                            </Typography>

                            <Typography>
                                Maintenance Percentage: {flag.maintenance_percentage}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
export default MaintenanceFlags;