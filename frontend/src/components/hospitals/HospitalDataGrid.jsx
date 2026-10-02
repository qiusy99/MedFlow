import { Alert, CircularProgress, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import apiClient from "../../api/client";

const columns = [
    {field: 'id', headerName: 'ID', width: 100},
    {field: 'name', headerName: 'Name', width: 200},
    {field: 'location_region', headerName: 'Location Region', width: 200},
    {field: 'capacity', headerName: 'Capacity', width: 200},
    {field: 'supervisor_id', headerName: 'Supervisor ID', width: 200},
];

function HospitalDataGrid() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchHospitals() {
        setLoading(true)
        try {
            const response = await apiClient.get('/hospitals');
            setHospitals(response.data);
            setError(null);
        } catch {
            setError("Could not load Hospitals data");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchHospitals();
    }, []);

    return (
        <Box sx={{height: 400, width:'100%'}}>
            {loading && <CircularProgress/>}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && ! error && (
                <DataGrid
                    rows={hospitals}
                    columns={columns}
                />
            )}
        </Box>
    );
}
export default HospitalDataGrid;