// src/pages/InOutPage.tsx
import { type GridColDef, type GridRowClassNameParams } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import InOutDashboard from '../components/InOutDashboard';
import ImageTag from '../components/ImageTag';
import BlackListAlert from '../components/BlackListAlert';
import { SseService } from '../services/Sse.service';
import { LprDataApi, type LprRecord } from '../services/LprData.service';
import dayjs from 'dayjs';

// 1. กำหนดโครงสร้างคอลัมน์ (Columns)
const columns: GridColDef[] = [
    {
        field: 'datetime',
        headerName: 'เวลาเข้า',
        flex: 1,
        headerAlign: 'center',
        renderCell: (params) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',     // กลางแนวตั้ง
                    justifyContent: 'center', // กลางแนวนอน
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                    {dayjs(params.value).format('DD/MM/YYYY HH:mm:ss')}
                </Typography>
            </div>
        ),
    },
    {
        field: 'direction_th',
        headerName: 'ประเภท',
        flex: 1,
        headerAlign: 'center',
        align: 'center',
        // renderCell: (params) => (
        //     <Typography variant="body2">{params.value}</Typography>
        // ),
    },
    {
        field: 'images',
        headerName: 'ภาพ',
        flex: 2,
        sortable: false,
        headerAlign: 'center',
        renderCell: (params) => (
            <div className='flex w-full gap-2 h-full'>
                <ImageTag tag={params.row.vehicle_group_en} img={params.row.overview_image_url} />
                <ImageTag tag={params.row.member_group_en} img={params.row.driver_image_url} />
            </div>
        ),
    },
    {
        field: 'licensePlate',
        headerName: 'เลขทะเบียน',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <div className='flex justify-center items-center h-full'>
                <div className='flex flex-col items-center'>
                    <Typography variant="body2" sx={{ color: params.row.vehicle_group_id == 5 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                        {params.row.plate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.region_th}
                    </Typography>

                </div>
            </div>
        )
    },
    { field: 'vehicle_make', headerName: 'ยี่ห้อ', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'vehicle_color_th', headerName: 'สี', flex: 1, headerAlign: 'center', align: 'center' },
    {
        field: 'name',
        headerName: 'ชื่อ-นามสกุล',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <div className='flex justify-start items-center h-full'>
                <Typography variant="body2" sx={{ color: params.row.member_group_en === 'blacklist' ? 'red' : 'inherit' }}>
                    {params.row.member_firstname}&nbsp;{params.row.member_lastname}
                </Typography>
            </div>
        )
    },
    {
        field: 'department_name',
        headerName: 'หน่วยงาน',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                    {params.value ?? '-'}
                </Typography>
            </div>
        ),
    },
    {
        field: 'member_expire',
        renderHeader: () => (
            <div style={{ textAlign: 'center', whiteSpace: 'normal', lineHeight: 1.2 }}>
                <span>จำนวนวัน</span><br />
                <span>หมดอายุ</span>
            </div>
        ),
        flex: 1,
        headerAlign: 'center',
        renderCell: (params) => {
            const expireDate = params.value ? dayjs(params.value) : null;
            const today = dayjs();
            let diffText = "-";

            if (expireDate) {
                const diffDays = expireDate.diff(today, "day");
                diffText = diffDays >= 0 ? `( ${diffDays} วัน )` : `( หมดอายุแล้ว)`;
            }

            return (
                <Typography
                    variant="body2"
                    sx={{ color: expireDate && expireDate.isBefore(today) ? "red" : "inherit" }}
                >
                    {params.value}<br />
                    {diffText}
                </Typography>
            );
        },
    }
];



// ฟังก์ชันสำหรับกำหนด class ให้กับแถว
const getRowClassName = (params: GridRowClassNameParams) => {
    // ถ้า isBlacklist เป็น true ให้ใช้ class 'highlight-row'
    return params.row.isBlacklist ? 'highlight-row' : '';
};

const DashBoardPage = () => {
    // Popup state & detection (mock for new blacklist event)
    const [openAlert, setOpenAlert] = useState(false);
    const [alertIndex, setAlertIndex] = useState<string | null>(null);
    const lastShownIdRef = useRef<string | null>(null);

    const [rows, setRows] = useState<LprRecord[]>([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [refreshDashboard, setRefreshDashboard] = useState(0);


    useEffect(() => {
        const sse = new SseService(); // ✅ ไม่ต้องส่ง url จะใช้จาก env
        sse.connect((msg) => {
            console.log("📥 Feed:", msg.data);
            fetchData(paginationModel.page, paginationModel.pageSize);
            setRefreshDashboard(prev => prev + 1);
        });

        return () => {
            sse.close();
        };
    }, []);


    useEffect(() => {
        fetchData(paginationModel.page, paginationModel.pageSize);
    }, []);

    useEffect(() => {
        const newest = rows[0];
        if (newest && (newest.vehicle_group_en === 'blacklist' || newest.member_group_en === 'blacklist') && newest.id !== lastShownIdRef.current) {
            lastShownIdRef.current = newest.id;
            setAlertIndex(newest.id); // เก็บ id
            setOpenAlert(true);
        }
    }, [rows]);

    const fetchData = async (page: number, pageSize: number) => {
        try {
            const res = await LprDataApi.feed(
                page + 1, // API เริ่มนับจาก 1
                pageSize
            );
            if (res.success) {
                setRows(res.data);
                setRowCount(res.pagination?.countAll ?? 0);
                console.log('✅ list:', res.data, res.pagination);
            } else {
                console.error('⚠️ list failed:', res.message);
            }
        } catch (err: any) {
            console.error('❌ API error:', err.message || err);
        }
    };

    const handlePaginationChange = (model: { page: number; pageSize: number }) => {
        setPaginationModel(model);
        fetchData(model.page, model.pageSize); // ⬅️ ยิง API
    };

    const alertData = alertIndex ? rows.find(r => r.id === alertIndex) ?? null : null;

    return (
        <div className='flex flex-col  gap-4 h-full'>
            <Typography variant='h5' className='text-primary-dark '>ข้อมูลการเข้า-ออกพื้นที่ ณ ปัจจุบัน</Typography>
            <div className="flex gap-4">
                <InOutDashboard refreshKey={refreshDashboard} />
                <div className="flex-1 flex flex-col min-w-0">
                    <DataTable
                        rows={rows}
                        columns={columns}
                        getRowClassName={getRowClassName}
                        getRowId={(row) => row.id}
                        paginationModel={paginationModel}
                        rowCount={rowCount}
                        onPaginationModelChange={handlePaginationChange}
                        rowHeight={75}

                    />
                </div>
            </div>
            {alertData && (
                <BlackListAlert
                    open={openAlert}
                    onClose={() => setOpenAlert(false)}
                    typeText={`ประเภท : ${alertData.direction === 'in' ? 'ขาเข้า' : 'ขาออก'}`}
                    dateTimeText={dayjs(alertData.epoch_start).format('DD/MM/YYYY HH:mm')}
                    vehicle={{
                        plate: alertData.plate ?? '-',
                        province: alertData.region_th ?? '-',
                        brand: alertData.vehicle_make ?? '-',
                        color: alertData.vehicle_color_th ?? '-',
                        imageUrl: alertData.overview_image, // รถ
                    }}
                    person={{
                        fullName: `${alertData.member_firstname ?? ''} ${alertData.member_lastname ?? ''}`.trim() || '-',
                        agency: alertData.department_name ?? '-',
                        imageUrl: alertData.driver_image_url, // ใช้รูปป้ายหรือ portrait ถ้ามี
                    }}
                />
            )}
        </div>
    );
};

export default DashBoardPage;

