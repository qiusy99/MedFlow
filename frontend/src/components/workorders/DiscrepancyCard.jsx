import {Alert, Card, CardContent, Stack, Typography} from '@mui/material'

function DiscrepancyCard({discrepancy}) {
    return (
        <Card variant='outlined' sx={{minWidth: 280}}>
            <CardContent>
                <Typography variant='h6' component="div">
                    {discrepancy.title}
                </Typography>
                <Typography color='text.secondary' gutterBottom>
                    Work Order #: {discrepancy.workorder_id}
                </Typography>
                <Stack spacing={0.5} sx={{mb:1.5}}>
                    <Typography variant='body2'>
                        Equipment Hospital: {discrepancy.equipment_hospital_id}
                    </Typography>
                    <Typography variant='body2'>
                        Technician Hospital: {discrepancy.technician_hospital_id}
                    </Typography>
                </Stack>
                <Alert severity='warning'>Hospital Mismatch Detected</Alert>
            </CardContent>
        </Card>
    );
}
export default DiscrepancyCard;