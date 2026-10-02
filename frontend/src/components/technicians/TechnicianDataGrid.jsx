import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Alert, Box, CircularProgress} from "@mui/material";
import apiClient from "../../api/client";

const columns = [
    {field: 'id', headerName: 'ID', width: 200},
    {field: 'name', headerName: 'Name', width: 200},
    {field: 'facility_id', headerName: 'Facility ID', width: 200},
    {field: 'supervisor_id', headerName: 'Supervisor ID', width: 200},
];

function TechnicianDataGrid() {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [dialogOpen, setDialogOpen] = useState(false);
    // const [formValues, setFormValues] = useState({
    //     name: '',
    //     facility_id: '',
    //     supervisor_id: '',
    // });

    async function fetchTechnicians() {
        setLoading(true);
        try {
            const response = await apiClient.get('/technicians');
            setTechnicians(response.data);
            setError(null);
        } catch {
            setError("Could not load technician data")
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchTechnicians();
    }, []);

    return (
        <Box sx={{height: 400, width: '100%'}}>
            {loading && <CircularProgress/>}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <DataGrid
                    rows={technicians}
                    columns={columns}
                />
            )}
        </Box>
    );
}
export default TechnicianDataGrid;