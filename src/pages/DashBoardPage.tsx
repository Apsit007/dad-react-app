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
import dialog from '../services/dialog.service';
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import ImageViewer from '../components/ImageViewer';







const DashBoardPage = () => {
    // Popup state & detection (mock for new blacklist event)
    const [openAlert, setOpenAlert] = useState(false);
    const [alertIndex, setAlertIndex] = useState<string | null>(null);
    const lastShownIdRef = useRef<string | null>(null);

    const [rows, setRows] = useState<LprRecord[]>([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [refreshDashboard, setRefreshDashboard] = useState(0);
    const [alertTitle, setAlertTitle] = useState<Record<string, string>>({})

    const [highlightedRows, setHighlightedRows] = useState<Record<string, boolean>>({});
    const prevRowsRef = useRef<LprRecord[]>([]);

    const isFirstLoadRef = useRef(true); // ✅ บอกว่าโหลดครั้งแรกหรือยัง
    const hasLeftFirstPageRef = useRef(false); // เคยออกจาก page 0 แล้วหรือยัง

    const paginationRef = useRef(paginationModel);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState<string[]>([]);

    // sync ref ทุกครั้งที่ paginationModel เปลี่ยน
    useEffect(() => {
        paginationRef.current = paginationModel;
    }, [paginationModel]);

    useEffect(() => {

        const sse = new SseService();
        sse.connect((msg) => {
            console.log("📥 Feed:", msg.data);
            const { page, pageSize } = paginationRef.current; // ✅ ใช้ค่าปัจจุบันจริง
            fetchData(page, pageSize);
            setRefreshDashboard(prev => prev + 1);
        });

        return () => sse.close();
    }, []); // ⬅️ ไม่ต้องเพิ่ม dependency


    useEffect(() => {
        fetchData(paginationModel.page, paginationModel.pageSize);
    }, []);

    useEffect(() => {
        if (paginationModel.page !== 0) return;
        const newest = rows[0];
        if (!newest) return;
        const vehecleTitle = newest.vehicle_group_en
        const memberTitle = newest.member_group_en
        const lprTitle = newest.driver_group_en
        if ((vehecleTitle === 'Blacklist' || memberTitle === 'Blacklist' || lprTitle === 'Blacklist' ||
            vehecleTitle === 'VIP' || memberTitle === 'VIP' || lprTitle === 'VIP' ||
            vehecleTitle === 'Watchlist' || memberTitle === 'Watchlist' || lprTitle === 'Watchlist'
        ) && newest.id !== lastShownIdRef.current) {
            if (newest.id !== lastShownIdRef.current) {
                lastShownIdRef.current = newest.id;
                setAlertTitle({
                    vehecleTitle: vehecleTitle,
                    memberTitile: memberTitle,
                    lprTitle: lprTitle
                    // vehecleTitle: 'Blacklist',
                    // memberTitle: 'Blacklist',
                    // lprTitle: 'Blacklist'
                })
                setAlertIndex(newest.id); // เก็บ id
                setOpenAlert(true);
            }
            else {
                setAlertTitle({})
            }
        }
    }, [rows, paginationModel.page]);

    const fetchData = async (page: number, pageSize: number) => {
        // dialog.loading();
        try {
            // ✅ เงื่อนไข includeFaceData ตามที่ต้องการ
            const includeFaceData =
                page === 0 &&
                !isFirstLoadRef.current &&
                !hasLeftFirstPageRef.current;

            const res = await LprDataApi.feed(page + 1, pageSize, includeFaceData);

            if (res.success) {
                const newData = res.data;

                // ✅ ถ้าเคยออกจากหน้าแรกแล้ว ให้จำไว้
                if (page > 0) {
                    hasLeftFirstPageRef.current = true;
                }

                // ✅ แสดงผลตามเดิม
                const newHighlights: Record<string, boolean> = {};
                newData.forEach((r) => {
                    if (!prevRowsRef.current.find((prev) => prev.id === r.id)) {
                        newHighlights[r.id] = true;
                    }
                });

                if (Object.keys(newHighlights).length > 0) {
                    setHighlightedRows(newHighlights);
                    setTimeout(() => setHighlightedRows({}), 2000);
                }

                setRows(newData);
                setRowCount(res.pagination?.countAll ?? 0);
                prevRowsRef.current = newData;

                // ✅ หลังจากโหลดครั้งแรกแล้ว
                if (isFirstLoadRef.current) {
                    isFirstLoadRef.current = false;
                }

                // dialog.close();
            } else {
                // dialog.close();
                console.error("⚠️ list failed:", res.message);
            }
        } catch (err: any) {
            dialog.close();
            console.error("❌ API error:", err.message || err);
        }
    };

    const handlePaginationChange = (model: { page: number; pageSize: number }) => {
        setPaginationModel(model);
        fetchData(model.page, model.pageSize); // ⬅️ ยิง API
    };

    const alertData = alertIndex ? rows.find(r => r.id === alertIndex) ?? null : null;

    // ฟังก์ชันสำหรับกำหนด class ให้กับแถว
    const getRowClassName = (params: GridRowClassNameParams) => {
        if (highlightedRows[params.id as string]) {
            return 'new-row-highlight';
        }
        return params.row.isBlacklist ? 'highlight-row' : '';
    };

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
            renderCell: (params) => (
                <div className='flex justify-center items-center h-full'>
                    <Typography variant="body2">{params.value}({params.row.lprId})</Typography>
                </div>
            ),
        },
        {
            field: 'access_config',
            headerName: 'เงื่อนไขเปิดไม้กั้น',
            flex: 1.5,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className='flex flex-col justify-center items-center h-full'>
                    <Typography variant="body2">บัตร {params.value.member ? <CheckIcon fontWeight="small" /> : <CloseIcon fontWeight="small" />}</Typography>
                    <Typography variant="body2">ใบหน้าบุคคล {params.value.face ? <CheckIcon fontWeight="small" /> : <CloseIcon fontWeight="small" />}</Typography>
                    <Typography variant="body2">ป้ายทะเบียน {params.value.plate ? <CheckIcon fontWeight="small" /> : <CloseIcon fontWeight="small" />}</Typography>
                </div>
            ),
        },
        {
            field: 'images',
            headerName: 'ภาพ',
            flex: 2,
            sortable: false,
            headerAlign: 'center',
            renderCell: (params) => {
                const vehicleImg = params.row.overview_image_url;
                const driverImg = params.row.driver_image_url;
                const memberImg = params.row.member_image_url;

                const imgList = [vehicleImg, driverImg, memberImg].filter(Boolean);

                return (
                    <div
                        className="flex w-full gap-2 h-full cursor-pointer"
                        onClick={() => {
                            if (imgList.length > 0) {
                                setViewerImages(imgList);
                                setViewerOpen(true);
                            }
                        }}
                    >
                        <ImageTag tag={params.row.vehicle_group_en} img={vehicleImg} disableViewImg />
                        <ImageTag tag={params.row.driver_group_en} img={driverImg} disableViewImg />
                        <ImageTag tag={params.row.member_group_en} img={memberImg} disableViewImg />
                    </div>
                );
            },
        },
        {
            field: 'licensePlate',
            headerName: 'เลขทะเบียน',
            flex: 1.5,
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
                <div className='flex justify-center items-center h-full'>
                    <Typography variant="body2" sx={{ color: params.row.member_group_en === 'blacklist' ? 'red' : 'inherit' }}>
                        {params.row.member_firstname || params.row.member_firstname ? params.row.member_firstname + ' ' + params.row.member_lastname : '-'}
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
                    <div className='flex justify-center items-center h-full'>
                        <Typography
                            variant="body2"
                            sx={{ color: expireDate && expireDate.isBefore(today) ? "red" : "inherit" }}
                        >
                            {params.value}<br />
                            {diffText}
                        </Typography>
                    </div>
                );
            },
        }
    ];

    return (
        <>
            <div className='flex flex-col  gap-4 h-full'>
                <Typography variant='h5' className='text-primary-dark !mt-[5px] '>ข้อมูลการเข้า-ออกพื้นที่ ณ ปัจจุบัน</Typography>
                <div className="flex gap-4">
                    <InOutDashboard refreshKey={refreshDashboard} />
                    <div className="flex-1 flex flex-col min-w-0">
                        <DataTable
                            rows={rows}
                            columns={columns}
                            getRowClassName={getRowClassName}
                            getRowId={(row) => row.id}
                            paginationModel={paginationModel}
                            rowCount={100}
                            onPaginationModelChange={handlePaginationChange}
                            rowHeight={75}

                        />
                    </div>
                </div>
                {alertData && (
                    <BlackListAlert
                        open={openAlert}
                        onClose={() => setOpenAlert(false)}
                        alertTitle={alertTitle}
                        department={alertData.department_name}
                        typeText={`ประตู : ${alertData.direction === 'in' ? 'ขาเข้า' : 'ขาออก'} ${alertData.lprId}`}
                        dateTimeText={dayjs(alertData.datetime).format('DD/MM/YYYY HH:mm')}
                        vehicle={{
                            plate: alertData.plate ?? '-',
                            province: alertData.region_th ?? '-',
                            brand: alertData.vehicle_make ?? '-',
                            color: alertData.vehicle_color_th ?? '-',
                            imageUrl: alertData.overview_image_url ?? null, // รถ
                        }}
                        member={{
                            fullName: `${alertData.member_firstname ?? ''} ${alertData.member_lastname ?? ''}`.trim() || '-',
                            agency: alertData.department_name ?? '-',
                            imageUrl: alertData.member_image_url ?? null, // ใช้รูปป้ายหรือ portrait ถ้ามี
                        }}
                        lpr={{
                            fullName: `${alertData.driver_firstname ?? ''} ${alertData.driver_lastname ?? ''}`.trim() || '-',
                            agency: alertData.department_name ?? '-',
                            imageUrl: alertData.driver_image_url ?? null, // ใช้รูปป้ายหรือ portrait ถ้ามี
                        }}
                    />
                )}
            </div>
            <ImageViewer
                open={viewerOpen}
                imgUrls={viewerImages}
                onClose={() => setViewerOpen(false)}
            />
        </>
    );
};

export default DashBoardPage;

