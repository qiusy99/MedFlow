import { Grid } from "@mui/material";
import TechnicianCard from "./TechnicianCard";

function TechnicianList({technicians}) {
    return (
        <Grid container spacing={2}>
            {technicians.map((technician) => (
                <Grid itme key={technician.id}>
                    <TechnicianCard technician={technician}/>
                </Grid>
            ))}
        </Grid>
    );
}
export default TechnicianList;