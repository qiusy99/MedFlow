import {Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, MenuItem} from '@mui/material'
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

const USER_ROLE = ['Clinical_Admin', 'Field_Technician', 'Auditor']

function UserDataGrid({ onSuccess }) {
    const {user} = useAuth();
    const isAdmin = user?.role === "Clinical_Admin";
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formValues, setFormValues] = useState({
        username: '',
        password: '',
        role: 'Auditor'
    });
    const handleFieldChange = (field) => (event) => {
    setFormValues((prev) => ({
        ...prev,
        [field]: event.target.value}));
    };
    const columns = [
        {field: 'id', headerName: 'ID', width: 100},
        {field: 'username', headerName: 'Username', width: 200},
        {field: 'role', headerName: 'Role', width: 200},
        {field: 'is_active', headerName: 'Active', width: 120},
        {field: 'action', headerName: '', width: 230, sortable: false, filterable: false, headerClassName: 'action-header',
            renderCell: (params) => (
                isAdmin ? (
                    <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 1, height: '100%'}}
                    >
                        <Button
                            variant='outlined' size='small' startIcon={<EditOutlinedIcon/>}
                            onClick={() => setEditingUser(params.row)}
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
    
    async function fetchUsers() {
        setLoading(true)
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);
            setError(null);
        } catch {
            setError("Could not load User data")
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async() => {
        try {
            await apiClient.post("/auth/register", {
                username: formValues.username,
                password: formValues.password,
                role: formValues.role
            });
            setDialogOpen(false);
            setFormValues({username: '', password: '', role: ''});
            onSuccess(`User ${formValues.username} created.`)
            await fetchUsers();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not create user");
        }
    };

    const handleUpdate = async() => {
        try {
            await apiClient.patch(
                `/users/${editingUser.id}`,
                {role: editingUser.role, is_active: editingUser.is_active}
            );
            onSuccess(`User ${editingUser.username} updated.`);
            setEditingUser(null);
            await fetchUsers();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not update User")
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.username}?`
        );
        if(!confirmed) {
            return;
        }

        try {
            await apiClient.delete(`/users/${user.id}`);
            onSuccess(`User ${user.username} deleted.`);
            await fetchUsers();
        } catch(err) {
            console.log(err.response?.data);
            setError("Could not delete user.");
        }
    };

    if (loading) return <CircularProgress/>
    if (error) return <Alert severity='error'>{error}</Alert>

    return (
        <Box>
            <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                {isAdmin && (
                    <Button variant='outlined' sx={{mb:2}} onClick={() => setDialogOpen(true)}>Add User</Button>
                )}
            </Box>
            <Dialog open={editingUser !== null} onClose={() => setEditingUser(null)}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1, minWidth: 300}}>
                        <TextField select label="Role" value={editingUser?.role || ''} onChange={(event) =>
                            setEditingUser({...editingUser, role: event.target.value})}>
                                {USER_ROLE.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                        </TextField>
                        <TextField select label="Status" value={editingUser?.is_active ?? ''} onChange={(event) =>
                            setEditingUser({...editingUser, is_active: event.target.value})}>
                                <MenuItem value={true}>Active</MenuItem>
                                <MenuItem value={false}>Inactive</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingUser(null)}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{height: 400, width:'100%'}}>
                <DataGrid rows={users} columns={columns} getRowId={(row) => row.id} sx={{
                    '& .action-header .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    }
                }}/>
            </Box>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt:1, minWidth: 300}}>
                        <TextField label="Username" value={formValues.username} onChange={handleFieldChange('username')}/>
                        <TextField label="Password" type='password' value={formValues.password} onChange={handleFieldChange('password')}/>
                        <TextField select label="Role" value={formValues.role} onChange={handleFieldChange('role')}>
                            {USER_ROLE.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
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
export default UserDataGrid;