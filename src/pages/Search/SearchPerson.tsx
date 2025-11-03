// src/pages/SearchPerson.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Avatar, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DataTable from '../../components/DataTable';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import ImageTag from '../../components/ImageTag';
import { useEffect, useRef, useState } from 'react';
import dialog from '../../services/dialog.service';
import dayjs, { Dayjs } from 'dayjs';
import { FaceDataApi, type FaceData } from '../../services/FaceData.service';
import { useSelector } from 'react-redux';
import { selectMemberGroups } from '../../store/slices/masterdataSlice';
import { exportData } from '../../services/Export.service';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FileUploadApi from '../../services/FileUpload.service';
import ImageViewer from '../../components/ImageViewer';

const columnsExport = [
    { field: "overview_image", headerName: "ภาพรถ", width: 50 },
    { field: "face_url", headerName: "ภาพคนขับ", width: 50 },
    { field: "fdlib_url", headerName: "ภาพสมาชิก", width: 50 },
    { field: "name", headerName: "ชื่อ-นามสกุล" },
    { field: "similarity", headerName: "% ความคล้ายคลึง" },
    { field: "department", headerName: "หน่วยงาน" },
    { field: "licensePlate", headerName: "เลขทะเบียน" },
    { field: "vehicle_make_name_en", headerName: "ยี่ห้อ" },
    { field: "vehicle_color_name_th", headerName: "สี" },
    { field: "date_time_in", headerName: "วันเวลาเข้า" },
    { field: "date_time_out", headerName: "เวลาออก" },
];

const searchType = [
    { id: 1, value: "in", label: "เวลาเข้า" },
    { id: 2, value: "out", label: "เวลาออก" },
]


const SearchPerson = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const memberGroups = useSelector(selectMemberGroups);

    // --- filters ---
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [sDirection, setSDirection] = useState<string>('');
    const [memberGroupId, setMemberGroupId] = useState<number | "">("");
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    // ✅ table state
    const [rows, setRows] = useState<FaceData[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState<string[]>([]);

    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [exportType, setExportType] = useState<"txt" | "xlsx" | "csv" | "pdf" | null>(null);
    const [exportLimit, setExportLimit] = useState<number>(100);

    // ✅ เปิด popup
    const openExportPopup = (type: "txt" | "xlsx" | "csv" | "pdf") => {
        setExportType(type);
        setOpenExportDialog(true);
    };
    // ✅ เมื่อยืนยันใน popup
    const handleConfirmExport = async () => {
        if (!exportLimit || exportLimit <= 0) {
            dialog.warning("กรุณาระบุจำนวนรายการที่ต้องการส่งออก");
            return;
        }

        try {
            setLoading(true);

            const params = {
                page: 1,
                limit: exportLimit,
                orderBy: "id.desc",
                firstname: firstname ? `${firstname}*` : undefined,
                lastname: lastname ? `${lastname}*` : undefined,
                member_group_id: memberGroupId || undefined,
                direction: sDirection || undefined,
                image_url: uploadedImageUrl || undefined,
                start_date: startDate ? startDate.toISOString() : undefined,
                end_date: endDate ? endDate.toISOString() : undefined,
            };

            const res = await FaceDataApi.search(params);
            if (res.success) {
                const data = res.data || [];

                if (exportType === "pdf") {
                    const processedRows = data.map((r: FaceData) => ({
                        ...r,
                        name: r.member_data
                            ? `${r.member_data.title ?? ""}${r.member_data.firstname ?? ""} ${r.member_data.lastname ?? ""}`.trim()
                            : "-",
                        similarity:
                            r.similarity != null && !isNaN(Number(r.similarity))
                                ? `${(Number(r.similarity) * 100).toFixed(2)}%`
                                : "-",
                        department: r.member_data?.department_name ?? "-",
                        licensePlate: r.plate
                            ? `${r.plate}\n${r.region_name_th || "-"}`
                            : "-",
                        vehicle_make_name_en: r.vehicle_make_name_en ?? "-",
                        vehicle_color_name_th: r.vehicle_color_name_th ?? "-",
                        date_time_in: r.date_time_in
                            ? dayjs(r.date_time_in).format("DD/MM/YYYY HH:mm:ss")
                            : "-",
                        date_time_out: r.date_time_out
                            ? dayjs(r.date_time_out).format("DD/MM/YYYY HH:mm:ss")
                            : "-",
                    }));

                    exportData(processedRows, "pdf", "ค้นหาบุคคล", columnsExport);
                } else {
                    exportData(prepareExportRows(data), exportType!, "face_data");
                }
            } else {
                dialog.error("ไม่สามารถดึงข้อมูลสำหรับส่งออกได้");
            }
        } catch (err) {
            console.error("❌ Export error:", err);
            dialog.error("เกิดข้อผิดพลาดในการส่งออก");
        } finally {
            setLoading(false);
            setOpenExportDialog(false);
        }
    };

    const loadData = async (page = 1, limit = 10, imageUrl?: string) => {
        try {
            const params = {
                page,
                limit,
                orderBy: "id.desc",
                firstname: firstname ? `${firstname}*` : undefined,
                lastname: lastname ? `${lastname}*` : undefined,
                member_group_id: memberGroupId || undefined,
                direction: sDirection || undefined,
                image_url: imageUrl || undefined, // ✅ เพิ่มตรงนี้
                start_date: startDate ? startDate.toISOString() : undefined,
                end_date: endDate ? endDate.toISOString() : undefined,
            };

            const res = await FaceDataApi.search(params);
            if (res.success) {
                setRows(res.data || []);
                setRowCount(res.pagination?.countAll || 0);
            }
        } catch (err) {
            console.error("❌ Load face-data error:", err);
            dialog.error("โหลดข้อมูลไม่สำเร็จ");
        }
    };

    useEffect(() => {
        loadData(1, paginationModel.pageSize);
    }, []);

    const clearImage = () => {
        if (selectedImage) URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onPickFile = () => fileInputRef.current?.click();

    const validateFile = (file: File) => {
        const isValidType = ['image/png', 'image/jpeg'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) {
            dialog.warning('อนุญาตเฉพาะไฟล์ PNG หรือ JPEG');
            return false;
        }
        if (!isValidSize) {
            dialog.warning('ขนาดไฟล์ต้องไม่เกิน 5MB');
            return false;
        }
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!validateFile(file)) return;
        const previewUrl = URL.createObjectURL(file);
        setSelectedImage(previewUrl);
    };

    // 👉 กดค้นหา
    const handleSearch = async () => {
        try {
            setLoading(true);
            let imageUrl: string | undefined = undefined;

            // ✅ ถ้ามีรูป ให้ upload ก่อน
            if (selectedImage && fileInputRef.current?.files?.[0]) {
                const file = fileInputRef.current.files[0];
                const uploadRes = await FileUploadApi.upload(file);
                if (uploadRes.success && uploadRes.data.length > 0) {
                    imageUrl = uploadRes.data[0].url;
                    setUploadedImageUrl(imageUrl); // ✅ เก็บไว้ใช้ตอนเปลี่ยนหน้า
                } else {
                    dialog.error("อัปโหลดรูปไม่สำเร็จ");
                    setLoading(false);
                    return;
                }
            } else {
                // ✅ ถ้าไม่มีรูป ให้ล้างค่าเก่า
                setUploadedImageUrl(undefined);
            }

            // ✅ เริ่มค้นหาที่หน้าแรกเสมอ
            const newModel = { page: 0, pageSize: paginationModel.pageSize };
            setPaginationModel(newModel);

            // ✅ เรียก loadData พร้อมส่ง image_url ถ้ามี
            await loadData(1, newModel.pageSize, imageUrl);
        } catch (err) {
            console.error("❌ Search error:", err);
            dialog.error("เกิดข้อผิดพลาดในการค้นหา");
        } finally {
            setLoading(false);
        }
    };

    // 👉 เปลี่ยนหน้า pagination
    const handlePageChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
        loadData(model.page + 1, model.pageSize, uploadedImageUrl);
    };

    // 👉 clear filter
    const handleClear = () => {
        setFirstname("");
        setLastname("");
        setMemberGroupId("");
        setSDirection("");
        setStartDate(null);
        setEndDate(null);
        setRows([]);
        setRowCount(0);
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });

        clearImage();
        setUploadedImageUrl(undefined); // ✅ ล้าง URL ที่อัปโหลดไว้ด้วย

        loadData(1, paginationModel.pageSize);
    };

    // --- Data for Table ---
    const columns: GridColDef[] = [
        {
            field: 'rownumb',
            headerName: 'ลำดับ',
            width: 80,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
                const pagination = params.api.state.pagination.paginationModel;
                return (
                    <span>
                        {pagination.page * pagination.pageSize + rowIndex + 1}
                    </span>
                );
            },
        },
        {
            field: 'image',
            headerName: 'ภาพ',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => {
                const overviewImg = params.row.overview_image ?? "";
                const driverImg = params.row.driver_image_url ?? "";
                const memberImg = params.row.fdlib_url ?? "";
                const imgList = [overviewImg, driverImg, memberImg].filter(Boolean);

                return (
                    <div
                        className="flex w-full gap-2 h-full p-[1px] cursor-pointer"
                        onClick={() => {
                            if (imgList.length > 0) {
                                setViewerImages(imgList);
                                setViewerOpen(true);
                            }
                        }}
                    >
                        <ImageTag
                            tag={params.row.vehicle_group_name_en ?? null}
                            img={overviewImg}
                            disableViewImg
                        />
                        <ImageTag
                            tag={params.row?.driver_group_name_en ?? null}
                            img={driverImg}
                            disableViewImg
                        />
                        <ImageTag
                            // tag={params.row.member_data?.member_group_name_en ?? null}
                            tag={params.row.driver_group_name_en ?? null}
                            img={memberImg}
                            disableViewImg
                        />
                    </div>
                );
            },
        },
        {
            field: 'name',
            headerName: 'ชื่อ-นามสกุล',
            flex: 1,
            minWidth: 200,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const md = params.row.member_data;
                const fullname = md ? `${md.title ?? ''} ${md.firstname ?? ''} ${md.lastname ?? ''}`.trim() : '-';
                return (
                    <div className="flex justify-center items-center h-full">
                        <Typography>{fullname || '-'}</Typography>
                    </div>
                );
            },
        },
        {
            field: 'similarity',
            headerName: '% ความคล้ายคลึง',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className="flex justify-center items-center h-full">
                    <Typography>
                        {params.value != null ? `${(Number(params.value) * 100).toFixed(2)}%` : '-'}
                    </Typography>
                </div>
            ),
        },
        {
            field: 'department',
            headerName: 'หน่วยงาน',
            minWidth: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className="flex justify-center items-center h-full">
                    <Typography>
                        {params.row.member_data?.department_name ?? '-'}
                    </Typography>
                </div>
            ),
        },
        {
            field: 'licensePlate',
            headerName: 'เลขทะเบียน',
            minWidth: 150,
            headerAlign: 'center',
            renderCell: (params) => (
                <div className="flex justify-center items-center h-full">
                    <div className="flex flex-col items-center">
                        <Typography
                            variant="body2"
                            sx={{
                                color: params.row.vehicle_group_id === 5 ? 'red' : 'inherit',
                                fontWeight: 'bold',
                            }}
                        >
                            {params.row.plate ?? '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {params.row.region_name_th ?? '-'}
                        </Typography>
                    </div>
                </div>
            ),
        },
        {
            field: 'vehicle_make_name_en',
            headerName: 'ยี่ห้อ',
            minWidth: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>{params.value ?? '-'}</Typography>
                </div>
            ),
        },
        {
            field: 'vehicle_color_name_th',
            headerName: 'สี',
            flex: 1,
            minWidth: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>{params.value ?? '-'}</Typography>
                </div>
            ),
        },
        {
            field: 'date_time_in',
            headerName: 'วันเวลาเข้า',
            flex: 1,
            minWidth: 250,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>
                        {params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm:ss') : '-'}
                    </Typography>
                </div>
            ),
        },
        {
            field: 'date_time_out',
            headerName: 'เวลาออก',
            flex: 1,
            minWidth: 250,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>
                        {params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm:ss') : '-'}
                    </Typography>
                </div>
            ),
        },
    ];

    const prepareExportRows = (rows: FaceData[]) => {
        return rows.map((r, i) => ({
            ลำดับ: i + 1,
            ชื่อ: r.member_data
                ? `${r.member_data.title ?? ""}${r.member_data.firstname ?? ""} ${r.member_data.lastname ?? ""}`.trim()
                : "-",
            "% ความคล้ายคลึง":
                r.similarity != null && !isNaN(Number(r.similarity))
                    ? `${(Number(r.similarity) * 100).toFixed(2)}%`
                    : "-",
            ประเภทกลุ่มรถ: r.vehicle_data?.vehicle_group_name_th ?? "ทั่วไป",
            หน่วยงาน: r.member_data?.department_name ?? "-",
            เลขทะเบียน: r.plate ?? "-",
            ยี่ห้อ: r.vehicle_make_name_en ?? "-",
            สี: r.vehicle_color_name_th ?? "-",
            ประเภทบุคคล: r.driver_group_name_th ?? "ทั่วไป",
            "วันเวลาเข้า": r.date_time_in ? dayjs(r.date_time_in).format("DD/MM/YYYY HH:mm:ss") : "-",
            "เวลาออก": r.date_time_out ? dayjs(r.date_time_out).format("DD/MM/YYYY HH:mm:ss") : "-",
        }));
    };

    // ✅ ฟังก์ชัน Export หลัก
    const handleExport = (type: "txt" | "xlsx" | "csv" | "pdf") => {
        if (!rows.length) return dialog.warning("ไม่มีข้อมูลให้ส่งออก");
        const paginationInfo = {
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            rowCount: rowCount,
        };
        if (type === "pdf") {
            // ✅ เตรียมข้อมูลก่อน export PDF
            const processedRows = rows.map((r) => ({
                ...r,
                name: r.member_data
                    ? `${r.member_data.title ?? ""}${r.member_data.firstname ?? ""} ${r.member_data.lastname ?? ""}`.trim()
                    : "-",
                similarity:
                    r.similarity != null && !isNaN(Number(r.similarity))
                        ? `${(Number(r.similarity) * 100).toFixed(2)}%`
                        : "-",
                department: r.member_data?.department_name ?? "-",
                // licensePlate: r.plate ?? "-",
                licensePlate: r.plate
                    ? `${r.plate}\n${r.region_name_th || "-"}`
                    : "-",
                vehicle_make_name_en: r.vehicle_make_name_en ?? "-",
                vehicle_color_name_th: r.vehicle_color_name_th ?? "-",
                date_time_in: r.date_time_in
                    ? dayjs(r.date_time_in).format("DD/MM/YYYY HH:mm:ss")
                    : "-",
                date_time_out: r.date_time_out
                    ? dayjs(r.date_time_out).format("DD/MM/YYYY HH:mm:ss")
                    : "-",
            }));

            exportData(processedRows, "pdf", "ค้นหาบุคคล", columnsExport, paginationInfo);
        } else {
            exportData(prepareExportRows(rows), type, "face_data");
        }
    };

    return (
        <>
            <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark !mt-[5px]'>
                    ค้นหาบุคคล
                </Typography>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>Search</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'white' }}>
                        <div className="flex flex-wrap">
                            <div className="w-full md:w-1/6 p-2 text-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Box sx={{ position: 'relative', width: 120, height: 150, m: 'auto' }}>
                                    {selectedImage ? (
                                        <Avatar
                                            variant="rounded"
                                            src={selectedImage}
                                            onClick={onPickFile}
                                            sx={{ width: '100%', height: '100%', cursor: 'pointer' }}
                                        />
                                    ) : (
                                        <Box
                                            role="button"
                                            onClick={onPickFile}
                                            className="flex flex-col items-center justify-center cursor-pointer border border-dashed border-gray-300 hover:bg-gray-50"
                                            sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                                        >
                                            <CloudUploadOutlinedIcon sx={{ color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="caption" color="text.secondary">Upload รูปภาพ</Typography>
                                        </Box>
                                    )}
                                    {selectedImage && (
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            title="ล้างรูป"
                                            className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full shadow p-1"
                                            style={{ lineHeight: 0 }}
                                        >
                                            <CloseRoundedIcon fontSize="small" />
                                        </button>
                                    )}
                                </Box>
                            </div>
                            <div className="w-full md:w-5/6 p-2">
                                <div className="flex flex-wrap -m-2">
                                    <div className="w-full sm:w-1/3 p-2">
                                        <Typography variant='caption'>ชื่อ</Typography>
                                        <TextField placeholder='ชื่อ' value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                                    </div>
                                    <div className="w-full sm:w-1/3 p-2">
                                        <Typography variant='caption'>นามสกุล</Typography>
                                        <TextField placeholder='นามสกุล' value={lastname} onChange={(e) => setLastname(e.target.value)} />
                                    </div>
                                    <div className="w-full sm:w-1/3 p-2">
                                        <Typography variant='caption'>ประเภทบุคคล</Typography>
                                        <Select value={memberGroupId} onChange={(e) => setMemberGroupId(e.target.value)}>
                                            <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                            {memberGroups.map((g) => (
                                                <MenuItem key={g.id} value={g.id}>
                                                    {g.name_th}  ({g.name_en})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-1/3 p-2">
                                        <Typography variant='caption'>รูปแบบการค้นหา</Typography>
                                        <Select displayEmpty value={sDirection} onChange={(e) => setSDirection(e.target.value as unknown as string)}>
                                            <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
                                            {searchType.map(g => (
                                                <MenuItem key={g.id} value={g.value}>{g.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-1/3 p-2">
                                        <Typography variant='caption'>วันที่เริ่มต้น</Typography>
                                        <DateTimePicker sx={{ width: '100%' }} value={startDate} onChange={setStartDate} maxDateTime={endDate ?? undefined} />
                                    </div>
                                    <div className="w-full sm:w-1/3 p-2">
                                        <Typography variant='caption'>วันที่สิ้นสุด</Typography>
                                        <DateTimePicker sx={{ width: '100%' }} value={endDate} onChange={setEndDate} minDateTime={startDate ?? undefined} />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex justify-end p-2  gap-2">
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelOutlinedIcon />}
                                    className="!border-gray-400 !text-gray-600 hover:!bg-gray-100"
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SearchIcon />}
                                    className='!bg-primary hover:!bg-primary-dark'
                                    onClick={handleSearch}
                                    disabled={loading}
                                >
                                    {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                                </Button>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>

                {/* --- Toolbar --- */}
                <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/txt-file.png" />}
                        onClick={() => openExportPopup("txt")}
                    >
                        TXT
                    </Button>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/xls-file.png" />}
                        onClick={() => openExportPopup("xlsx")}
                    >
                        XLS
                    </Button>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/csv-file.png" />}
                        onClick={() => openExportPopup("csv")}
                    >
                        CSV
                    </Button>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/pdf-file.png" />}
                        onClick={() => openExportPopup("pdf")}
                    >
                        PDF
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" sx={{ alignSelf: "center" }}>
                        ผลการค้นหา : {rowCount} รายการ
                    </Typography>
                </Stack>

                <div className="flex-1 flex flex-col ">
                    <DataTable
                        rows={rows}
                        columns={columns}
                        paginationModel={paginationModel}
                        rowCount={rowCount}
                        onPaginationModelChange={handlePageChange}
                        getRowId={(row) => row.id}
                    />
                </div>
            </Box>
            <ImageViewer
                open={viewerOpen}
                imgUrls={viewerImages}
                onClose={() => setViewerOpen(false)}
            />
            <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
                <DialogTitle>กำหนดจำนวนรายการที่ต้องการส่งออก</DialogTitle>
                <DialogContent>
                    <TextField
                        label="จำนวนรายการ"
                        type="number"
                        fullWidth
                        value={exportLimit}
                        onChange={(e) => setExportLimit(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExportDialog(false)}>ยกเลิก</Button>
                    <Button
                        onClick={handleConfirmExport}
                        variant="contained"
                        className="!bg-primary hover:!bg-primary-dark"
                    >
                        ตกลง
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SearchPerson;
