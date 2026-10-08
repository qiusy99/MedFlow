import apiClient from "../../api/client";
import { useState, useEffect } from "react";
import {Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Menu} from '@mui/material'
import { DataGrid } from "@mui/x-data-grid";

import { useAuth } from "../../context/AuthContext.jsx";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

function ServiceReportDataGrid({ onSuccess }) {
    const {user} = useAuth();
    const isAdmin = user?.role === "Clinical_Admin";
    const canAdd = user?.role === "Clinical_Admin" || user?.role === "Field_Technician";
    const [servicereports, setServiceReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingServiceReport, setEditingServiceReport] = useState(null);
    const [formValues, setFormValues] = useState({
        work_order_id: '',
        file_url: null,
        notes: '',
    });
    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: event.target.value}));
    };
    const columns = [
        {field: 'id', headerName: 'ID', width: 100},
        {field: 'work_order_id', headerName: 'Work Order ID', width: 250},
        {field: 'file_url', headerName: 'File URL', width: 300},
        {field: 'notes', headerName: 'Notes', width: 300},
        {field: 'timestamp', headerName: 'Timestamp', width: 200},
        {field: 'action', headerName: '', width: 230, sortable: false, filterable: false, 
            renderCell: (params) => (
                isAdmin ? (
                    <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 1, height: '100%'}}
                    >
                        <Button
                            variant='outlined' size='small' startIcon={<EditOutlinedIcon/>}
                            onClick={() => setEditingServiceReport(params.row)}
                        >
                            Edit
                        </Button>

                        <Button variant='outlined' color='error' size='small' startIcon={<DeleteIcon/>} onClick={() => handleDelete(params.row)}
                        >
                            Delete
                        </Button>
                    </Box>
                ): null
            )
        }
    ];

    async function fetchServiceReports() {
        setLoading(true)
        try {
            const response = await apiClient('/servicereports');
            setServiceReports(response.data);
            setError(null);
        } catch {
            setError("Could not load Service Report.");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchServiceReports();
    }, []);

    const handleCreate = async() => {
        if (!formValues.file) {
            setError("Please select a file.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('work_order_id', formValues.work_order_id);
            formData.append('file', formValues.file);

            if (formValues.notes) {
                formData.append('notes', formValues.notes);
            }

            await apiClient.post('/servicereports', formData);
            const uploadFileName = formValues.file.name;
            setDialogOpen(false)
            setFormValues({work_order_id: '', file_url: null, notes: ''});
            onSuccess(`Service Report ${uploadFileName} created.`);
            await fetchServiceReports();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not create Service Report.")
        }
    };

    const handleUpdate = async() => {
        try {
            await apiClient.patch(
                `/servicereports/${editingServiceReport.id}`,
                {notes: editingServiceReport.notes}
            );
            setEditingServiceReport(null);
            onSuccess(`ServiceReport ${editingServiceReport.file_url} updated.`);
            await fetchServiceReports();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not update Service Report.");
        }
    };

    const handleDelete = async(servicereport) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${servicereport.file_url}?`
        );
        if (!confirmed) {
            return;
        }
        try {
            await apiClient.delete(`/servicereports/${servicereport.id}`);
            onSuccess(`Service Report ${servicereport.file_url} deleted.`);
            await fetchServiceReports();
        } catch (err) {
            console.log(err.response?.data);
            setError("Could not delete Service Report.");
        }
    };

    if (loading) return <CircularProgress />
    if (error) return <Alert severity="error">{error}</Alert>

    return (
        <Box>
            <Box sx={{display: 'Flex', gap:2, mb: 2}}>
                {canAdd && (
                    <Button variant="outlined" sx={{mb:2}} onClick={() => setDialogOpen(true)}>Add Service Report</Button>
                )}
            </Box>
            <Dialog open={editingServiceReport !== null} onClose={() => setEditingServiceReport(null)}>
                <DialogTitle>Edit Service Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1, minWidth: 300}}>
                        <TextField label="notes" value={editingServiceReport?.notes || ''} onChange={(event) =>
                            setEditingServiceReport({...editingServiceReport, notes: event.target.value})}/>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingServiceReport(null)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{height: 400, width:'100%'}}>
                <DataGrid rows={servicereports} columns={columns} getRowId={(row) => row.id} sx={{
                    '& .action-header .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    }
                }}/>
            </Box>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add New ServiceReport</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt:1, minWidth: 300}}>
                        <TextField label="Work Order ID" type="number" value={formValues.work_order_id} onChange={handleFieldChange('work_order_id')}/>
                        <input type="file" onChange={(event) => {
                            const selectedFile = event.target.files?.[0] || null;
                            setFormValues((prev) => ({...prev, file: selectedFile,}));
                        }}/>
                        {formValues.file && (
                            <Box>
                                Selected file: {formValues.file.name}
                            </Box>
                        )}
                        <TextField label="Notes" value={formValues.notes} onChange={handleFieldChange('notes')}/>                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
export default ServiceReportDataGrid;