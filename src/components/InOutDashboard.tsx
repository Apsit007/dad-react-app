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
            <div className="h-full flex flex-col gap-2">
                {/* Total In-Out Card */}
                <div className='p-2 bg-primary text-white  rounded-md shadow-md'>
                    <Typography variant="subtitle1" gutterBottom>รถเข้า-ออกในพื้นที่</Typography>
                    <Box className="flex items-center text-center">
                        <Box className="flex-1">
                            <Typography variant="h4" className="!font-bold text-gold">{summaryData.totalInOut.in}</Typography>
                            <Typography variant="caption">จำนวน<span className='text-gold'>รถเข้า</span>ทั้งหมด</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />
                        <Box className="flex-1">
                            <Typography variant="h4" className="!font-bold text-gold">{summaryData.totalInOut.out}</Typography>
                            <Typography variant="caption">จำนวน<span className='text-gold'>รถออก</span>ทั้งหมด</Typography>
                        </Box>
                    </Box>
                </div>

                {/* Still Inside Card */}
                <div className='p-2 bg-primary text-white text-center rounded-md shadow-md'>
                    <Typography variant="subtitle1" gutterBottom>รถยังอยู่ในพื้นที่</Typography>
                    <Typography variant="h3" className="!font-bold text-gold">{summaryData.stillInside}</Typography>
                    <Typography variant="caption">จำนวน<span className='text-gold'>รถที่ยังอยู่ภายในพื้นที่ </span></Typography>
                </div>





                {categoryData.map((item) => {
                    const isBlacklist = item.title === 'Blacklist';
                    return (
                        <div key={item.title} className='p-2 bg-[#C5C8CB] rounded-md shadow-md'>
                            <Typography sx={{ fontWeight: 'bold' }} className={isBlacklist ? 'text-red-500' : 'text-primary-dark'}>
                                {item.title}
                            </Typography>
                            <Box className="flex items-center text-center">
                                <Box className="flex-1">
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }} className={isBlacklist ? 'text-red-500' : 'text-primary-dark'}>
                                        {item.in}
                                    </Typography>
                                    {
                                        isBlacklist ?
                                            (<><Typography variant="caption" color="text.secondary">จำนวน<span className='text-red-500'>รถ Blacklist </span></Typography></>)
                                            :
                                            (<><Typography variant="caption" color="text.secondary">{item.inLabel}</Typography></>)
                                    }

                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(0, 0, 0, 0.12)', mx: 1, height: '3rem', alignSelf: 'center' }} />
                                <Box className="flex-1">
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }} className={isBlacklist ? 'text-red-500' : 'text-primary-dark'}>
                                        {item.out}
                                    </Typography>
                                    {
                                        isBlacklist ?
                                            (<><Typography variant="caption" color="text.secondary">จำนวน<span className='text-red-500'>บุคคล Blacklist </span></Typography></>)
                                            :
                                            (<><Typography variant="caption" color="text.secondary">{item.outLabel}</Typography></>)
                                    }

                                </Box>
                            </Box>
                        </div>

                    );
                })}
            </div>
        </Box >
    );
};

export default InOutDashboard;