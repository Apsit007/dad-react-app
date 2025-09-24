// src/components/InOutDashboard.tsx
import { Paper, Typography, Box, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { LprDataApi, type LprStat } from '../services/LprData.service';



type InOutDashboardProps = {
    refreshKey: number;
};



const InOutDashboard = ({ refreshKey }: InOutDashboardProps) => {

    const [stats, setStats] = useState<LprStat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await LprDataApi.getStats();
            setStats(res.data.stats);
        } catch (err) {
            console.error("❌ Failed to fetch LPR stats", err);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchData();
    }, [refreshKey]);

    if (loading) {
        return <Typography className="p-4">Loading...</Typography>;
    }

    // ✅ ดึง All Groups มาใช้เป็น summary
    const allGroup = stats.find((s) => s.vehicle_group_id === -1);
    const summaryData = {
        totalInOut: {
            in: allGroup?.total_in ?? 0,
            out: allGroup?.total_out ?? 0,
        },
        stillInside: allGroup?.remains ?? 0,
    };

    // ✅ กรองกลุ่มย่อย (ไม่เอา All Groups และ No Group)
    const categoryData = stats.filter(
        (s) => s.vehicle_group_id !== -1 && s.vehicle_group_name !== "No Group"
    ).map((s) => ({
        title: s.vehicle_group_name,
        in: s.total_in,
        out: s.total_out,
        inLabel: `จำนวนรถ ${s.vehicle_group_name}`,
        outLabel: `จำนวนบุคคล ${s.vehicle_group_name}`,
    }));
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