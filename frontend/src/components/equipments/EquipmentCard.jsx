// 负责“一个 Equipment 长什么样”

import {Card, CardContent, Chip, Stack, Typography} from '@mui/material'

const LOW_CHARGE_LEVEL_THRESHOLD = 20;
function EquipmentCard({equipment}) {
    const isLowCharge = equipment.charge_level <= LOW_CHARGE_LEVEL_THRESHOLD;
    return (
        <Card variant='outlined' sx={{minWidth: 240}}>
            <CardContent>
                <Typography variant='h6' component="div">
                    {equipment.serial_number}
                </Typography>
                <Typography color='text.secondary' gutterBottom>
                    {equipment.model}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        label={`${equipment.charge_level}% charge`}
                        color={isLowCharge ? 'error' : 'success'}
                        size='small'
                        />
                        <Chip label={equipment.status} variant='outlined' size='small' />
                </Stack>
            </CardContent>
        </Card>
    );
}
export default EquipmentCard