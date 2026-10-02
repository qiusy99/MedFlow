import { Card, CardContent, Typography } from "@mui/material";

function TechnicianCard({technician}) {
    return (
        <Card variant="outlined" sx={{minWidth: 240}}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {technician.name}
                </Typography>
                <Typography variant="h6" component="div">
                    {technician.facility_id}
                </Typography>
                <Typography variant="h6" component="div">
                    {technician.supervisor_id}
                </Typography>
            </CardContent>
        </Card>
    );
}
export default TechnicianCard;