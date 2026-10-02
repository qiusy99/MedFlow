import { Grid, Alert, CircularProgress } from "@mui/material"
import { useEffect, useState } from "react";
import apiClient from "../../api/client";
import ReliabilityMetricsCard from "./ReliabilityMetricsCard"

function ReliabilityMetricsList() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchMetrics() {
        setLoading(true);
        try {
            const response = await apiClient.get(
                "/workorders/reliabilitymetrics"
            );
            setMetrics(response.data);
            setError(null);
        } catch {
            setError("Could not load reliability metrics")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMetrics();
    }, []);

    if (loading) return <CircularProgress/>
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Grid container spacing={2}>
            {metrics.map((metric) => (
                <Grid key={metric.workorder_id}>
                    <ReliabilityMetricsCard metric={metric}/>
                </Grid>
            ))}
        </Grid>
    );
}
export default ReliabilityMetricsList;