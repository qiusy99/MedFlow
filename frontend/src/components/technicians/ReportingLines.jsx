import { useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";
import { Alert, Box, CircularProgress, Typography, TextField, Button, Card, CardContent } from "@mui/material";
import apiClient from "../../api/client";

function ReportingLines() {
    const [supervisorId, setSupervisorId] = useState('');
    const [reportingLine, setReportingLine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function fetchReportingLine() {
        if (!supervisorId) {
            setError("Please enter a supervisor ID");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(
                `/reportinglines/${supervisorId}`
            );
            setReportingLine(response.data);
        } catch {
            setError("Could not load reporting line");
            setReportingLine(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="Supervisor ID"
                    size="small"
                    value={supervisorId}
                    onChange={(event) => setSupervisorId(event.target.value)}
                />
                <Button
                    variant="contained"
                    onClick={fetchReportingLine}
                >
                    Search
                </Button>
                
            </Box>

            {loading && <CircularProgress />}
            {error && (
                <Alert severity="error">{error}</Alert>
            )}
            {reportingLine && !loading && !error && (
                <Card variant="outlined" sx={{ width: 280 }}>
                    <CardContent>
                        <Typography>
                            Supervisor ID: {reportingLine.supervisor_id}
                        </Typography>

                        <Typography>
                            Active Technicians: {reportingLine.total_technician}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default ReportingLines;