// src/components/InOutDashboard.tsx
import { Paper, Typography, Box, Divider } from '@mui/material';

// ... (ส่วน data structure เหมือนเดิม)
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
        <Box className="w-80 flex-shrink-0 h-full flex flex-col">
            {/* ✨ 1. เปลี่ยน div ครอบการ์ดให้เป็น flex container แนวตั้ง */}
            <div className="flex-1 h-full flex flex-col gap-2">
                {/* Total In-Out Card */}
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#1A486C', color: 'white' }}>
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
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#1A486C', color: 'white' }}>
                    <Typography variant="subtitle1" gutterBottom>รถยังอยู่ในพื้นที่</Typography>
                    <Typography variant="h3" className="font-bold">{summaryData.stillInside}</Typography>
                    <Typography variant="caption">จำนวนรถที่ยังอยู่ภายในพื้นที่</Typography>
                </Paper>





                {categoryData.map((item) => {
                    const isBlacklist = item.title === 'Blacklist';
                    return (
                        <Paper elevation={2} sx={{ p: 2, bgcolor: '#C5C8CB', color: 'white' }}>
                            <Typography sx={{ fontWeight: 'bold', color: isBlacklist ? '#f44336' : 'text.primary' }}>
                                {item.title}
                            </Typography>
                            <Box className="flex items-center text-center">
                                <Box className="flex-1">
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: isBlacklist ? '#f44336' : 'text.primary' }}>
                                        {item.in}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{item.inLabel}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />
                                <Box className="flex-1">
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: isBlacklist ? '#f44336' : 'text.primary' }}>
                                        {item.out}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{item.outLabel}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                    );
                })}
            </div>
        </Box>
    );
};

export default InOutDashboard;