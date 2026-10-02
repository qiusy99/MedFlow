import {Grid} from '@mui/material';
import DiscrepancyCard from './DiscrepancyCard';

function DiscrepancyList({discrepancies}) {
    return (
        <Grid container spacing={2}>
            {discrepancies.map((discrepany) => (
                <Grid item key={discrepany.workorder_id}>
                    <DiscrepancyCard discrepancy={discrepany} />
                </Grid>
            ))}
        </Grid>
    );
}
export default DiscrepancyList;