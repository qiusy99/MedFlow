import { useEffect, useState } from "react";
import {DataGrid} from '@mui/x-data-grid';
import {Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField} from '@mui/material'
import apiClient from '../../api/client.js';
import { useAuth } from "../../context/AuthContext.jsx";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";

const STATUS_OPTIONS = ['Available', 'In-Use', 'Maintenance', 'Offline']

function EquipmentDataGrid({ onSuccess }) {
    const { user } = useAuth();
    const isAdmin = user?.role === "Clinical_Admin";
    const canEdit = user?.role === "Clinical_Admin"
    || user?.role === "Field_Technician";
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lowChargeOnly, setLowChargeOnly] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const columns = [
    {field: 'id', headerName: 'ID', width: 100},
    {field: 'serial_number', headerName: 'Serial Number', width: 200},
    {field: 'model', headerName: 'Model', width: 200},
    {field: 'status', headerName: 'Status', width: 180},
    {field: 'charge_level', headerName: 'Charge Level', width: 190, align: 'left', headerAlign: 'left', type: 'number',
        renderCell: (params) => {
            const isLowCharge = params.value < 20;

            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        height: '100%'
                    }}
                >
                    <span>{params.value}</span>

                    {isLowCharge && (
                        <BatteryAlertIcon
                            fontSize="small"
                            color="warning"
                        />
                    )}
                </Box>
            );
        }
    },
    {field: 'facility_id', headerName: 'Facility ID', width: 150, align: 'left', headerAlign: 'left', type: 'number'},
    {field: 'actions', headerName: '', width: 230, sortable: false, filterable: false, headerClassName: 'action-header',
        renderCell: (params) => (
            isAdmin ? (
                <Box
                    sx={{display: 'flex', alignItems: 'center', gap: 1, height: '100%'}}
                >
                    <Button
                        variant='outlined' size='small' startIcon={<EditOutlinedIcon/>}
                        onClick={() => setEditingEquipment(params.row)}
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
    const [formValues, setFormValues] = useState({
        serial_number: '',
        model: '',
        status: 'Available',
        charge_level: '',
        facility_id: '',
    });

    async function fetchEquipments() {
        setLoading(true);
        try {
            const response = await apiClient.get(
                lowChargeOnly
                    ? '/equipments?max_charge_level=20'
                    : '/equipments'
            );
            setEquipments(response.data);
            setError(null);
        } catch {
            setError('Could not load equipment data')
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchEquipments();
    }, [lowChargeOnly]);

    const handleFieldChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value}));
    }
    
    const handleCreate = async() => {
        try {
            await apiClient.post('/equipments', {
                ...formValues,
                charge_level: Number(formValues.charge_level),
                facility_id: Number(formValues.facility_id)
            });
            setDialogOpen(false)
            setFormValues({serial_number: '', model: '', status: 'Available', charge_level: '', facility_id: ''});
            onSuccess(`Equipment ${formValues.serial_number} created.`);
            await fetchEquipments();
        } catch {}
    };

    const handleUpdate = async () => {
        try {
            await apiClient.patch(
                `/equipments/${editingEquipment.id}`,
                {status: editingEquipment.status, charge_level: Number(editingEquipment.charge_level)}
            );
            setEditingEquipment(null);
            onSuccess(`Equipment ${editingEquipment.serial_number} updated.`);
            await fetchEquipments();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not update equipment");
        }
    };

    const handleDelete = async (equipment) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${equipment.serial_number}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiClient.delete(`/equipments/${equipment.id}`);
            onSuccess(`Equipment ${equipment.serial_number} deleted.`);
            await fetchEquipments();
        } catch (err) {
            console.log(err.response?.data);
            setError("Could not delete equipment");
        }
    };

    if (loading) return <CircularProgress />
    if (error) return <Alert severity="error">{error}</Alert>

    return (
        <Box>
            <Box sx={{display: 'Flex', gap:2, mb: 2}}>
                {isAdmin && (
                    <Button variant="outlined" sx={{mb:2}} onClick={() => setDialogOpen(true)}>Add Equipment</Button>
                )}
                <Button 
                    variant={lowChargeOnly ? "contained" : "outlined"} 
                    onClick={() => setLowChargeOnly(!lowChargeOnly)}
                    sx={{mb:2}}
                    >
                    {lowChargeOnly ? "Show All Equipment" : "Show Low Charge Level Only"}
                </Button>
            </Box>
            <Dialog open={editingEquipment !== null} onClose={() => setEditingEquipment(null)}>
                <DialogTitle>Edit Equipment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1, minWidth: 300}}>
                        <TextField select label="Status" value={editingEquipment?.status || ''} onChange={(event) =>
                            setEditingEquipment({...editingEquipment, status: event.target.value})}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Charge Level" type="number" value={editingEquipment?.charge_level || ''} onChange={(event) =>
                                setEditingEquipment({...editingEquipment, charge_level: event.target.value})}/>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingEquipment(null)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{height: 400, width:'100%'}}>
                <DataGrid rows={equipments} columns={columns} getRowId={(row) => row.id} sx={{
                    '& .action-header .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    }
                }}/>
            </Box>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt:1, minWidth: 300}}>
                        <TextField label="Serial Number" value={formValues.serial_number} onChange={handleFieldChange('serial_number')}/>
                        <TextField label="Model" value={formValues.model} onChange={handleFieldChange('model')}/>
                        <TextField label="Charge Level" type="number" value={formValues.charge_level} onChange={handleFieldChange('charge_level')}/>
                        <TextField label="Facility ID" type="number" value={formValues.facility_id} onChange={handleFieldChange('facility_id')}/>
                        <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
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
export default EquipmentDataGrid;