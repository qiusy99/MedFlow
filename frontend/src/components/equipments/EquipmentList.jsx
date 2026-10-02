// 负责“把很多个 Equipment Card 排出来”

import {Grid} from '@mui/material';
import EquipmentCard from './EquipmentCard.jsx';

function EquipmentList({equipments}) {
    return (
        <Grid container spacing={2}>
            {equipments.map((equipment) => (
                <Grid item key={equipment.id}>
                    <EquipmentCard atm={equipment} />
                </Grid>
            ))}
        </Grid>
    );
}
export default EquipmentList;
