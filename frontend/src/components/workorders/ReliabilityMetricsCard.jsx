import { Card, CardContent, Stack, Typography} from '@mui/material'

function ReliabilityMetricsCard({metric}) {
    return (
        <Card variant='outlined' sx={{minWidth: 280}}>
            <CardContent>
                <Typography variant='h6' component="div">
                    {metric.device_model}
                </Typography>
                <Stack spacing={0.5} sx={{mt:1}}>
                    <Typography variant='boday2'>
                        Completed: {metric.completion}
                    </Typography>
                    <Typography variant='body2'>
                        Failed: {metric.failure}
                    </Typography>
                    <Typography variant='body2'>
                        Completion/Failure Ratio: {metric.completion_failure_ratio ?? "N/A"}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}
export default ReliabilityMetricsCard;