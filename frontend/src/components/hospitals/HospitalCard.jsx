import { Card, CardContent, Typography } from "@mui/material";

function HospitalCard({hospital}) {
    return (
        <Card variant="outlined" sx={{minWidth: 240}}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {hospital.name}
                </Typography>
                <Typography variant="h6" component="div">
                    {hospital.location_region}
                </Typography>
                <Typography variant="h6" component="div">
                    {hospital.capacity}
                </Typography>
                <Typography variant="h6" component="div">
                    {hospital.supervisor_id}
                </Typography>
            </CardContent>
        </Card>
    );
}
export default HospitalCard;