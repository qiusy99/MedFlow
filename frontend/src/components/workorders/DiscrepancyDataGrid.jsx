import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import apiClient from "../../api/client.js";
import { Alert, Box, CircularProgress, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const columns = [
    {field: 'work_order_id', headerName: 'Work Order ID', flex: 1, width: 130},
    {field: 'title', headerName: 'Title', flex: 2, width: 300},
    {field: 'equipment_hospital_id', headerName: 'Equipment Hospital ID', flex: 1.5, width: 250},
    {field: 'technician_hospital_id', headerName: 'Technician Hospital ID', flex: 1.5, width: 250},
];

const PRIORITY_OPTIONS = ['', 'Low', 'Medium', 'Critical'];

function DiscrepancyDataGrid() {
    const [priority, setPriority] = useState('');
    const [discrepancies, setDiscrepancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        async function fetchDiscrepancies() {
            try {
                const response = await apiClient.get('/workorders/discrepancies',
                    {params: {priority: priority || undefined},}
                );
                if (isMounted) setDiscrepancies(response.data);
            } catch {
                if (isMounted) setError('Could not load Discrepancies report');
            } finally {
                // 请求已经结束了，不管成功还是失败，都不用继续显示 loading spinner
                if (isMounted) setLoading(false);
            }
        }
        fetchDiscrepancies();
        return () => {
            isMounted = false;
        };
    }, [priority]);
    return (
        <Box>
            <FormControl size="small" sx={{mb: 2, minWidth: 180}}>
                <InputLabel id="priority-filter-label">Priority</InputLabel>
                <Select
                    labelID="priority-filter-label"
                    label="priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}>
                        {PRIORITY_OPTIONS.map((option) => (
                            <MenuItem key={option || 'all'} value={option}>
                                {option === '' ? 'All':option}
                            </MenuItem>
                        ))}
                    </Select>
            </FormControl>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <Box sx={{height: 400, width: '100%'}}>
                    <DataGrid
                        rows={discrepancies}
                        columns={columns}
                        getRowId={(row) => row.work_order_id} />
                </Box>
            )}
        </Box>
    );
}
export default DiscrepancyDataGrid;