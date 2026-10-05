import {Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from '@mui/material'
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";


function HospitalDataGrid({ onSuccess }) {
    const { user } = useAuth();
    const isAdmin = user?.role === "Clinical_Admin";
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState(null);
    const [formValues, setFormValues] = useState({
        name: '',
        location_region: '',
        capacity: '',
        supervisor_id: '',
    });
    const handleFieldChange = (field) => (event) => {
    setFormValues((prev) => ({
        ...prev,
        [field]: event.target.value}));
    };
    const columns = [
        {field: 'id', headerName: 'ID', width: 100},
        {field: 'name', headerName: 'Name', width: 200},
        {field: 'location_region', headerName: 'Location Region', width: 200},
        {field: 'capacity', headerName: 'Capacity', width: 200},
        {field: 'supervisor_id', headerName: 'Supervisor ID', width: 200},
        {field: 'actions', headerName: '', width: 230, sortable: false, filterable: false, headerClassName: 'action-header',
            renderCell: (params) => (
                isAdmin ? (
                    <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 1, height: '100%'}}
                    >
                        <Button
                            variant='outlined' size='small' startIcon={<EditOutlinedIcon/>}
                            onClick={() => setEditingHospital(params.row)}
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
        },
    ];  

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

    const handleCreate = async() => {
        try {
            await apiClient.post('/hospitals', {
                ...formValues,
                capacity: Number(formValues.capacity),
                supervisor_id: Number(formValues.supervisor_id)
            });
            setDialogOpen(false)
            setFormValues({name: '', location_region: '', capacity: '', supervisor_id: ''});
            onSuccess(`Hospital ${formValues.name} created.`);
            await fetchHospitals();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not create Hospital")
        }
    };

    const handleUpdate = async () => {
        try {
            await apiClient.patch(
                `/hospitals/${editingHospital.id}`,
                {capacity: Number(editingHospital.capacity)}
            );
            setEditingHospital(null);
            onSuccess(`Hospital ${editingHospital.name} updated.`);
            await fetchHospitals();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not update hospital");
        }
    };

    const handleDelete = async (hospital) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${hospital.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiClient.delete(`/hospitals/${hospital.id}`);
            onSuccess(`Hospital ${hospital.name} deleted.`);
            await fetchHospitals();
        } catch (err) {
            console.log(err.response?.data);
            setError("Could not delete hospital.");
        }
    };

    if (loading) return <CircularProgress />
    if (error) return <Alert severity="error">{error}</Alert>

    return (
        <Box>
            <Box sx={{display: 'Flex', gap:2, mb: 2}}>
                {isAdmin && (
                    <Button variant="outlined" sx={{mb:2}} onClick={() => setDialogOpen(true)}>Add Hospital</Button>
                )}
            </Box>
            <Dialog open={editingHospital !== null} onClose={() => setEditingHospital(null)}>
                <DialogTitle>Edit Hospital</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1, minWidth: 300}}>
                        <TextField label="Capacity" type="number" value={editingHospital?.capacity || ''} onChange={(event) =>
                            setEditingHospital({...editingHospital, capacity: event.target.value})}/>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingHospital(null)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{height: 400, width:'100%'}}>
                <DataGrid rows={hospitals} columns={columns} getRowId={(row) => row.id} sx={{
                    '& .action-header .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    }
                }}/>
            </Box>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add New Hospital</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt:1, minWidth: 300}}>
                        <TextField label="Name" value={formValues.name} onChange={handleFieldChange('name')}/>
                        <TextField label="Location Region" value={formValues.location_region} onChange={handleFieldChange('location_region')}/>
                        <TextField label="Capacity" type="number" value={formValues.capacity} onChange={handleFieldChange('capacity')}/>
                        <TextField label="Supervisor ID" type="number" value={formValues.supervisor_id} onChange={handleFieldChange('supervisor_id')}/>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
export default HospitalDataGrid;