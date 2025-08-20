// src/components/InOutDashboard.tsx
import { Paper, Typography, Box, Grid, Divider } from '@mui/material';

// 1. อัปเดต Data Structure ให้มี label ที่แตกต่างกันได้
const summaryData = {
    totalInOut: { in: 500, out: 330 },
    stillInside: 170,
};

const categoryData = [
    { title: 'Member', in: 220, out: 180, inLabel: "จำนวนรถ Member", outLabel: "จำนวนบุคคล Member" },
    { title: 'Visitor', in: 120, out: 100, inLabel: "จำนวนรถ Visitor", outLabel: "จำนวนบุคคล Visitor" },
    { title: 'VIP', in: 30, out: 45, inLabel: "จำนวนรถ VIP", outLabel: "จำนวนบุคคล VIP" },
    { title: 'Blacklist', in: 120, out: 100, inLabel: "จำนวนรถ Blacklist", outLabel: "จำนวนบุคคล Blacklist" },
];

const InOutDashboard = () => {
    return (
        <Box className="w-80 flex-shrink-0">
            {/* Title ถูกย้ายไปอยู่ใน InOutPage แล้ว เราจึงลบจากตรงนี้ */}

            {/* Total In-Out Card */}
            <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: '#1A486C', color: 'white' }}>
                <Typography variant="subtitle1" gutterBottom>รถเข้า-ออกในพื้นที่</Typography>
                <Box className="flex items-center text-center">
                    <Box className="flex-1">
                        <Typography variant="h4" className="font-bold">{summaryData.totalInOut.in}</Typography>
                        <Typography variant="caption">จำนวนรถเข้าทั้งหมด</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />
                    <Box className="flex-1">
                        <Typography variant="h4" className="font-bold">{summaryData.totalInOut.out}</Typography>
                        <Typography variant="caption">จำนวนรถออกทั้งหมด</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Still Inside Card */}
            <Paper elevation={2} sx={{ p: 2, mb: 2, textAlign: 'center', bgcolor: '#1A486C', color: 'white' }}>
                <Typography variant="subtitle1" gutterBottom>รถยังอยู่ในพื้นที่</Typography>
                <Typography variant="h3" className="font-bold">{summaryData.stillInside}</Typography>
                <Typography variant="caption">จำนวนรถที่ยังอยู่ภายในพื้นที่</Typography>
            </Paper>

            {/* Category Cards */}
            <Paper elevation={2} className="p-4">
                <Grid container spacing={2}>
                    {categoryData.map((item) => {
                        const isBlacklist = item.title === 'Blacklist';
                        return (
                            <Grid  >
                                <Typography sx={{ fontWeight: 'bold', color: isBlacklist ? '#f44336' : 'text.primary' }}>
                                    {item.title}
                                </Typography>
                                <Box className="flex items-center text-center mt-1">
                                    <Box className="flex-1">
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: isBlacklist ? '#f44336' : 'text.primary' }}>
                                            {item.in}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{item.inLabel}</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '3rem', alignSelf: 'center' }} />
                                    <Box className="flex-1">
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: isBlacklist ? '#f44336' : 'text.primary' }}>
                                            {item.out}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{item.outLabel}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>
        </Box>
    );
};

export default InOutDashboard;