import { Grid } from "@mui/material"; 
import HospitalCard from "./HospitalCard";

function HospitalList(hospitals) {
    return (
        <Grid container spacing={2}>
            {hospitals.map((hospital) => {
                <Grid itme key={hospital.id}>
                    <HospitalCard hospital={hospital} />
                </Grid>
            })}
        </Grid>
    );
}
export default HospitalList;