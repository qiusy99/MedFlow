import {Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Menu} from '@mui/material'
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import apiClient from '../../api/client';
import { useAuth } from "../../context/AuthContext.jsx";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

const STATUS_OPTIONS = ['Pending', 'In-Progress', 'Completed', 'Failed']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'Critical']

function WorkOrderDataGrid({ onSuccess }) {
    const {user} = useAuth();
    const isAdmin = user?.role === "Clinical_Admin";
    const canchangeStatus = user?.role === "Clinical_Admin" || user?.role === "Field_Technician";
    const [workorders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] = useState(null);
    const columns = [
        {field: 'id', headerName: 'ID', width: 100},
        {field: 'title', headerName: 'Title', width: 300},
        {field: 'priority', headerName: 'Priority', width: 200},
        {field: 'status', headerName: 'Status', width: 170},
        {field: 'equipment_id', headerName: 'Equipment ID', width: 150, type: 'number'},
        {field: 'technician_id', headerName: 'Technician ID', width: 200, type: 'number'},
        {field: 'action', headerName: '', width: 230, sortable: false, filterable: false, headerClassName: 'action-header',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        height: '100%'
                    }}
                >
                    {canchangeStatus && (
                        <Button
                            variant='outlined'
                            size='small'
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => setEditingWorkOrder(params.row)}
                        >
                            Edit
                        </Button>
                    )}

                    {isAdmin && (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(params.row)}
                        >
                            Delete
                        </Button>
                    )}
                </Box>
            )
        }
    ];
    const [formValues, setFormValues] = useState({
        title: '',
        priority: 'Low',
        status: 'Pending',
        equipment_id: '',
        technician_id: '',
    });
    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    async function fetchWorkOrders() {
        setLoading(true);
        try {
            const response = await apiClient.get('/workorders');
            setWorkOrders(response.data);
            setError(null);
        } catch {
            setError("Could not load the Work Order data")
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const handleCreate = async() => {
        try {
            await apiClient.post('/workorders', {
                ...formValues,
                equipment_id: Number(formValues.equipment_id),
                technician_id: Number(formValues.technician_id)
            });
            setDialogOpen(false)
            setFormValues({title: '', priority: '', status: '', equipment_id: '', technician_id: ''});
            onSuccess(`WorkOrder ${formValues.title} created.`);
            await fetchWorkOrders();
        } catch {}
    };

    const handleUpdate = async() => {
        try {
            await apiClient.patch(
                `/workorders/${editingWorkOrder.id}/status`,
                {status: editingWorkOrder.status}
            );
            if (isAdmin) {
                await apiClient.patch(
                    `/workorders/${editingWorkOrder.id}/priority`,
                    {priority: editingWorkOrder.priority} 
                );
            }
            setEditingWorkOrder(null);
            onSuccess(`Work Order ${editingWorkOrder.title} updated.`)
            await fetchWorkOrders();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not update work order");
        }
    };

    const handleDelete = async (workorder) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${workorder.title}?`
        );
        if(!confirmed) {
            return;
        }
        try {
            await apiClient.delete(`/workorders/${workorder.id}`);
            onSuccess(`Work Order ${workorder.title} deleted.`)
            await fetchWorkOrders();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not delete work order");
        }
    };

    if (loading) return <CircularProgress />
    if (error) return <Alert severity='error'>{error}</Alert>

    return (
        <Box>
            <Box sx={{display: 'flex', gap:2, mb:2}}>
                {isAdmin && (
                    <Button variant='outlined' sx={{mb:2}} onClick={() => setDialogOpen(true)}> Add Work Order</Button>
                )}
            </Box>
            <Dialog open={editingWorkOrder !== null} onClose={() => setEditingWorkOrder(null)}>
                <DialogTitle>Edit Work Order</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1, minWidth: 300}}>
                        {isAdmin && (
                            <TextField select label="Priority" value={editingWorkOrder?.priority || ''} onChange={(event) => 
                                setEditingWorkOrder({...editingWorkOrder, priority: event.target.value})}>
                                {PRIORITY_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        <TextField select label="Status" value={editingWorkOrder?.status || ''} onChange={(event) =>
                            setEditingWorkOrder({...editingWorkOrder, status: event.target.value})}>
                                {STATUS_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingWorkOrder(null)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid rows={workorders} columns={columns} getRowId={(row) => row.id} sx={{
                    '& .action-header .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    }
                }}/>
            </Box>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add New Work Order</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1, minWidth: 300}}>
                        <TextField label="Title" value={formValues.title} onChange={handleFieldChange('title')}/>
                        <TextField select label="Priority" value={formValues.priority} onChange={handleFieldChange('priority')}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Equipment ID" value={formValues.equipment_id} onChange={handleFieldChange('equipment_id')}/>
                        <TextField label="Technician ID" value={formValues.technician_id} onChange={handleFieldChange('technician_id')}/>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant='contained'>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
export default WorkOrderDataGrid;