// src/components/InOutDashboard.tsx
import { Paper, Typography, Box, Divider } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { LprDataApi, type LprStat } from '../services/LprData.service';



type InOutDashboardProps = {
    refreshKey: number;
};



const InOutDashboard = ({ refreshKey }: InOutDashboardProps) => {

    const [stats, setStats] = useState<LprStat[]>([]);
    const [loading, setLoading] = useState(true);

    const [highlighted, setHighlighted] = useState<Record<string, boolean>>({});
    const prevStatsRef = useRef<LprStat[]>([]);
    const prevSummaryRef = useRef<{ in: number; out: number }>({ in: 0, out: 0 });

    const fetchData = async () => {
        try {
            const res = await LprDataApi.getStats();
            const newStats = res.data.stats;

            const allGroup = newStats.find((s) => s.vehicle_group_id === -1);
            const newSummary = {
                in: allGroup?.total_in ?? 0,
                out: allGroup?.total_out ?? 0,
            };

            const changed: Record<string, boolean> = {};

            // ✅ ตรวจฝั่ง summary
            if (prevSummaryRef.current.in !== newSummary.in) {
                changed["summary-in"] = true;
            }
            if (prevSummaryRef.current.out !== newSummary.out) {
                changed["summary-out"] = true;
            }
            prevSummaryRef.current = newSummary;

            // ✅ ตรวจ group อื่น ๆ
            newStats.forEach((s) => {
                const prev = prevStatsRef.current.find(
                    (p) => p.vehicle_group_id === s.vehicle_group_id
                );
                if (prev) {
                    if (prev.total_in !== s.total_in) {
                        changed[`${s.vehicle_group_id}-in`] = true;
                    }
                    if (prev.total_out !== s.total_out) {
                        changed[`${s.vehicle_group_id}-out`] = true;
                    }
                    if (prev.remains !== s.remains) {
                        changed[`${s.vehicle_group_id}-remains`] = true;
                    }
                }
            });

            if (Object.keys(changed).length > 0) {
                setHighlighted(changed);
                setTimeout(() => setHighlighted({}), 2000);
            }

            setStats(newStats);
            prevStatsRef.current = newStats;
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
        id: String(s.vehicle_group_id),
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
                <div className="p-2 bg-primary text-white rounded-md shadow-md">
                    <Typography variant="subtitle1" gutterBottom>รถเข้า-ออกในพื้นที่</Typography>
                    <Box className="flex items-center text-center">
                        {/* In */}
                        <Box
                            className={`flex-1 rounded transition-colors duration-1000 ${highlighted["summary-in"] ? "bg-orange-400" : ""
                                }`}
                        >
                            <Typography variant="h4" className="!font-bold text-gold">
                                {summaryData.totalInOut.in}
                            </Typography>
                            <Typography variant="caption">
                                จำนวน<span className="text-gold">รถเข้า</span>ทั้งหมด
                            </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />
                        {/* Out */}
                        <Box
                            className={`flex-1 rounded transition-colors duration-1000 ${highlighted["summary-out"] ? "bg-orange-400" : ""
                                }`}
                        >
                            <Typography variant="h4" className="!font-bold text-gold">
                                {summaryData.totalInOut.out}
                            </Typography>
                            <Typography variant="caption">
                                จำนวน<span className="text-gold">รถออก</span>ทั้งหมด
                            </Typography>
                        </Box>
                    </Box>
                </div>

                {/* Still Inside Card */}
                <div className={`p-2 text-white text-center rounded-md shadow-md transition-colors duration-1000
    ${highlighted["-1-remains"] ? "bg-orange-400" : "bg-primary"}`}>
                    <Typography variant="subtitle1" gutterBottom>รถยังอยู่ในพื้นที่</Typography>
                    <Typography variant="h3" className="!font-bold text-gold">{summaryData.stillInside}</Typography>
                    <Typography variant="caption">จำนวน<span className='text-gold'>รถที่ยังอยู่ภายในพื้นที่ </span></Typography>
                </div>





                {categoryData.map((item) => {
                    const isBlacklist = item.title === 'Blacklist';
                    return (
                        <div key={item.title} className="p-2 rounded-md shadow-md bg-[#C5C8CB]">
                            <Typography sx={{ fontWeight: 'bold' }} className={isBlacklist ? 'text-red-500' : 'text-primary-dark'}>
                                {item.title}
                            </Typography>
                            <Box className="flex items-center text-center">
                                <Box className={`flex-1 rounded transition-colors duration-1000
        ${highlighted[`${item.id}-in`] ? "bg-orange-400" : ""}`}>
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
                                <Box className={`flex-1 rounded transition-colors duration-1000
        ${highlighted[`${item.id}-out`] ? "bg-orange-400" : ""}`}>
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