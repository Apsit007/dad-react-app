// src/pages/SearchPerson.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Avatar, Stack } from '@mui/material';
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



const SearchPerson = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const memberGroups = useSelector(selectMemberGroups);

    // --- filters ---
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
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

    const loadData = async (page = 1, limit = 10) => {
        try {
            const params = {
                page,
                limit,
                orderBy: "id.asc",
                firstname: firstname || undefined,
                lastname: lastname || undefined,
                member_group_id: memberGroupId || undefined,
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
    const handleSearch = () => {
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
        loadData(1, paginationModel.pageSize);
    };

    // 👉 เปลี่ยนหน้า pagination
    const handlePageChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
        loadData(model.page + 1, model.pageSize);
    };

    // 👉 clear filter
    const handleClear = () => {
        setFirstname("");
        setLastname("");
        setMemberGroupId("");
        setStartDate(null);
        setEndDate(null);
        setRows([]);
        setRowCount(0);
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
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
            renderCell: (params) => (
                <div className="flex w-full gap-2 h-full p-[1px]">
                    <ImageTag
                        tag={params.row.vehicle_data?.vehicle_group_name_en ?? null}
                        img={params.row.overview_image ?? ""}
                    />
                    <ImageTag
                        tag={params.row.member_data?.member_group_name_en ?? null}
                        img={params.row.face_url ?? ""}
                    />
                </div>
            ),
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
            flex: 1,
            minWidth: 250,
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
            flex: 1,
            minWidth: 250,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Typography>{params.value ?? '-'}</Typography>
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
                <Typography>{params.value ?? '-'}</Typography>
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
                <Typography>
                    {params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm:ss') : '-'}
                </Typography>
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
                <Typography>
                    {params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm:ss') : '-'}
                </Typography>
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
            หน่วยงาน: r.member_data?.department_name ?? "-",
            เลขทะเบียน: r.plate ?? "-",
            ยี่ห้อ: r.vehicle_make_name_en ?? "-",
            สี: r.vehicle_color_name_th ?? "-",
            "วันเวลาเข้า": r.date_time_in ? dayjs(r.date_time_in).format("DD/MM/YYYY HH:mm:ss") : "-",
            "เวลาออก": r.date_time_out ? dayjs(r.date_time_out).format("DD/MM/YYYY HH:mm:ss") : "-",
        }));
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
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
                                                {g.name_th}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>วันที่เริ่มต้น</Typography>
                                    <DateTimePicker sx={{ width: '100%' }} value={startDate} onChange={setStartDate} />
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>วันที่สิ้นสุด</Typography>
                                    <DateTimePicker sx={{ width: '100%' }} value={endDate} onChange={setEndDate} />
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
                    onClick={() => exportData(prepareExportRows(rows), "txt", "face_data")}
                >
                    TXT
                </Button>
                <Button
                    variant="outlined"
                    className="!border-gold !text-primary"
                    size="small"
                    startIcon={<img src="/icons/xls-file.png" />}
                    onClick={() => exportData(prepareExportRows(rows), "xlsx", "face_data")}
                >
                    XLS
                </Button>
                <Button
                    variant="outlined"
                    className="!border-gold !text-primary"
                    size="small"
                    startIcon={<img src="/icons/csv-file.png" />}
                    onClick={() => exportData(prepareExportRows(rows), "csv", "face_data")}
                >
                    CSV
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
    );
};

export default SearchPerson;
