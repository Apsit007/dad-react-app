// src/pages/SearchCar.tsx

import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Stack, InputLabel, Autocomplete } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DataTable from '../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import ImageTag from '../../components/ImageTag';
import { useSelector } from 'react-redux';
import { selectRegions, selectVehicleColors, selectVehicleGroups, selectVehicleMakes } from '../../store/slices/masterdataSlice';
import { useEffect, useMemo, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { LprDataApi, type LprRecord } from '../../services/LprData.service';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dayjs from 'dayjs';
import { exportData } from '../../services/Export.service';
// --- 1. อัปเดต Columns ของตาราง ---
const columns: GridColDef[] = [
    {
        field: "rownumb",
        headerName: "ลำดับ",
        width: 80,
        align: "center",
        headerAlign: "center",
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
        field: "overview_image_url",
        headerName: "ภาพ",
        width: 200,
        headerAlign: "center",
        align: "center",
        sortable: false,
        renderCell: (params) => (
            <div className="flex w-full gap-2 h-full p-[1px]">
                <ImageTag
                    tag={params.row.vehicle_group_en ?? null}
                    img={params.value ?? ""}
                />
                <ImageTag
                    tag={params.row.member_group_en ?? null}
                    img={params.row.driver_image_url ?? ""}
                />
            </div>
        ),
    },
    {
        field: "licensePlate",
        headerName: "เลขทะเบียน",
        minWidth: 150,
        headerAlign: "center",
        renderCell: (params) => (
            <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center">
                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                params.row.vehicle_group_id === 5 ? "red" : "inherit",
                            fontWeight: "bold",
                        }}
                    >
                        {params.row.plate || "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.region_th || "-"}
                    </Typography>
                </div>
            </div>
        ),
    },
    {
        field: "vehicle_make",
        headerName: "ยี่ห้อ",
        flex: 1,
        minWidth: 120,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
            <Typography>{params.value || "-"}</Typography>
        ),
    },
    {
        field: "vehicle_color_th",
        headerName: "สี",
        flex: 1,
        minWidth: 120,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
            <Typography>{params.value || "-"}</Typography>
        ),
    },
    {
        field: "name",
        headerName: "ชื่อ-นามสกุล",
        flex: 1,
        minWidth: 200,
        headerAlign: "center",
        renderCell: (params) => {
            const firstname = params.row.member_firstname ?? "";
            const lastname = params.row.member_lastname ?? "";
            const fullname = `${firstname} ${lastname}`.trim();
            const displayName = fullname !== "" ? fullname : "-";
            return (
                <div className="flex justify-center items-center h-full">
                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                params.row.member_group_en === "blacklist"
                                    ? "red"
                                    : "inherit",
                        }}
                    >
                        {displayName}
                    </Typography>
                </div>
            );
        },
    },
    {
        field: "department_name",
        headerName: "หน่วยงาน",
        flex: 1.5,
        minWidth: 250,
        headerAlign: "center",
        renderCell: (params) => (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    textAlign: "center",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                    {params.value || "-"}
                </Typography>
            </div>
        ),
    },
    {
        field: "datetime_in",
        headerName: "วันเวลาเข้า",
        flex: 1,
        minWidth: 180,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
            <Typography variant="body2">
                {params.value
                    ? dayjs(params.value).format("DD/MM/YYYY HH:mm")
                    : "-"}
            </Typography>
        ),
    },
    {
        field: "datetime_out",
        headerName: "เวลาออก",
        flex: 1,
        minWidth: 180,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
            <Typography variant="body2">
                {params.value
                    ? dayjs(params.value).format("DD/MM/YYYY HH:mm")
                    : "-"}
            </Typography>
        ),
    },
];


const columnsExport = [

    {
        field: 'overview_image_url',
        headerName: 'ภาพรถ',
        width: 80,
    },
    {
        field: 'driver_image_url',
        headerName: 'ภาพคนขับ',
        width: 80,
    },
    {
        field: 'licensePlate',
        headerName: 'เลขทะเบียน',

    },
    { field: 'vehicle_make', headerName: 'ยี่ห้อ' },
    { field: 'vehicle_color_th', headerName: 'สี' },
    {
        field: 'name',
        headerName: 'ชื่อ-นามสกุล',


    },
    {
        field: 'department_name', headerName: 'หน่วยงาน', headerAlign: 'center',
    },
    {
        field: 'datetime_in', headerName: 'วันเวลาเข้า'
    },
    {
        field: 'datetime_out', headerName: 'เวลาออก'
    },
];

// ✅ ฟังก์ชันเตรียมข้อมูลก่อน export
const prepareExportRows = (rows: LprRecord[]) => {
    return rows.map((r, i) => {
        // สร้างเลขทะเบียนให้รวมหมวดจังหวัด
        const licensePlate =
            [r.plate ?? ""].filter(Boolean).join(" ").trim() || "-";
        const region =
            [r.region_th ?? ""].filter(Boolean).join(" ").trim() || "-";

        // รวมชื่อ-นามสกุล
        const fullname =
            [r.member_firstname ?? "", r.member_lastname ?? ""]
                .filter(Boolean)
                .join(" ")
                .trim() || "-";

        // แปลงวันเวลาให้เป็น format ที่อ่านง่าย
        const datetimeIn = r.datetime_in
            ? dayjs(r.datetime_in).format("DD/MM/YYYY HH:mm:ss")
            : "-";
        const datetimeOut = r.datetime_out
            ? dayjs(r.datetime_out).format("DD/MM/YYYY HH:mm:ss")
            : "-";

        return {
            ลำดับ: i + 1,
            "เลขทะเบียน": licensePlate,
            "จังหวัด": region,
            "ยี่ห้อ": r.vehicle_make ?? "-",
            "สี": r.vehicle_color_th ?? "-",
            "ชื่อ-นามสกุล": fullname,
            "หน่วยงาน": r.department_name ?? "-",
            "วันเวลาเข้า": datetimeIn,
            "เวลาออก": datetimeOut,
        };
    });
};

const searchType = [
    { id: 1, value: "in", label: "เวลาเข้า" },
    { id: 2, value: "out", label: "เวลาออก" },
]

const SearchCar = () => {

    // ====== Search form states (ด้านบน accordion) ======
    // ====== Search form states ======
    const [sPlatePrefix, setSPlatePrefix] = useState<string>('');
    const [sPlateNumber, setSPlateNumber] = useState<string>('');
    const [sRegionCode, setSRegionCode] = useState<string>('');
    const [sVehicleMake, setSVehicleMake] = useState<string>('');
    // const [sVehicleMakeInput, setSVehicleMakeInput] = useState<string>('');
    const [sVehicleColor, setSVehicleColor] = useState<string>('');
    const [sVehicleGroupId, setSVehicleGroupId] = useState<number | ''>('');
    const [sDirection, setSDirection] = useState<string>('');
    const [sStartDate, setSStartDate] = useState<Dayjs | null>(null);
    const [sEndDate, setSEndDate] = useState<Dayjs | null>(null);
    // Data states
    const [rows, setRows] = useState<LprRecord[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    // ✅ state เก็บ filter ล่าสุด

    const regions = useSelector(selectRegions);
    const makes = useSelector(selectVehicleMakes);
    const colors = useSelector(selectVehicleColors);
    const groups = useSelector(selectVehicleGroups);

    // options ของยี่ห้อ
    const searchMakeOptions = useMemo(
        () =>
            makes.map(m => ({
                value: m.make,
                label: m.make_en as string, // ถ้าอยากโชว์ภาษาไทยก็เปลี่ยนเป็น m.make_th
            })),
        [makes]
    );

    // === 2. ฟังก์ชันยิง API ===
    const handleSearch = async (page = paginationModel.page, pageSize = paginationModel.pageSize) => {
        try {
            const res = await LprDataApi.searchVehicles({
                plate_prefix: sPlatePrefix ? `${sPlatePrefix}*` : undefined,
                plate_number: sPlateNumber ? `${sPlateNumber}*` : undefined,
                region_code: sRegionCode || undefined,
                vehicle_make: sVehicleMake || undefined,
                vehicle_color: sVehicleColor || undefined,
                direction: sDirection || undefined,
                vehicle_group_id: sVehicleGroupId || undefined,
                start_date: sStartDate ? sStartDate.startOf('minute').toISOString() : undefined,
                end_date: sEndDate ? sEndDate.endOf('minute').toISOString() : undefined,
                page: page + 1, // API นับจาก 1
                limit: pageSize,
                orderBy: 'id.desc',
            });

            if (res.success) {
                setRows(res.data);
                setRowCount(res.pagination?.countAll ?? 0);
            }
        } catch (err) {
            console.error('❌ Search API error:', err);
        }
    };

    // ✅ ดึงข้อมูลเมื่อเปิดหน้า (โหลดหน้าแรก)
    useEffect(() => {
        handleSearch(0, paginationModel.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // === 3. pagination change ===
    const handlePaginationChange = (model: { page: number; pageSize: number }) => {
        setPaginationModel(model);
        handleSearch(model.page, model.pageSize);
    };
    const handleClearFilter = () => {
        setSPlatePrefix('');
        setSPlateNumber('');
        setSRegionCode('');
        setSVehicleMake('');
        setSDirection('');
        setSVehicleColor('');
        setSVehicleGroupId('');
        setSStartDate(null);
        setSEndDate(null);

        const newPagination = { page: 0, pageSize: paginationModel.pageSize };
        setPaginationModel(newPagination);

        handleSearch(newPagination.page, newPagination.pageSize);
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
                ค้นหารถ
            </Typography>

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>Search</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'white' }}>
                    {/* --- 3. อัปเดต Layout ของฟอร์มค้นหา --- */}
                    <div className="flex flex-col gap-4">
                        {/* Row 1 */}
                        <div className="flex flex-wrap -m-2">
                            {/* ทะเบียน */}
                            <div className="w-full flex sm:w-1/2 md:w-1/5">
                                <div className="w-full sm:w-1/3 md:w-1/3 p-2">
                                    <InputLabel shrink>ทะเบียน</InputLabel>
                                    <TextField
                                        placeholder="กง"
                                        value={sPlatePrefix}
                                        onChange={(e) => setSPlatePrefix(e.target.value)}
                                    />
                                </div>
                                <div className="w-full sm:w-2/3 md:w-2/3 p-2">
                                    <InputLabel shrink>&nbsp;</InputLabel>
                                    <TextField
                                        placeholder="เลขทะเบียน"
                                        value={sPlateNumber}
                                        onChange={(e) => setSPlateNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* หมวดจังหวัด */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>หมวดจังหวัด</InputLabel>
                                <Select
                                    value={sRegionCode}
                                    onChange={(e) => setSRegionCode(e.target.value as string)}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>ทุกจังหวัด</em></MenuItem>
                                    {regions.map(r => (
                                        <MenuItem key={r.id} value={r.region_code}>{r.name_th}</MenuItem>
                                    ))}
                                </Select>
                            </div>

                            {/* ยี่ห้อ */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>ยี่ห้อ</InputLabel>
                                <Autocomplete
                                    options={searchMakeOptions}
                                    value={searchMakeOptions.find(o => o.value === sVehicleMake) ?? null}
                                    onChange={(_, newValue) => {
                                        setSVehicleMake(newValue ? newValue.value : ''); // เก็บ make (string)
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="เลือกยี่ห้อ" />
                                    )}
                                    getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label ?? '')}
                                    isOptionEqualToValue={(a, b) => a.value === b.value}
                                />
                            </div>

                            {/* สี */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>สี</InputLabel>
                                <Select
                                    value={sVehicleColor}
                                    onChange={(e) => setSVehicleColor(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>ทุกสี</em></MenuItem>
                                    {colors.map(c => (
                                        <MenuItem key={c.id} value={c.color}>{c.color_th}</MenuItem>
                                    ))}
                                </Select>
                            </div>

                            {/* กลุ่มรถ */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>กลุ่มรถ</InputLabel>
                                <Select
                                    value={sVehicleGroupId}
                                    onChange={(e) => setSVehicleGroupId(e.target.value as unknown as number | '')}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>ทุกกลุ่ม</em></MenuItem>
                                    {groups.map(g => (
                                        <MenuItem key={g.id} value={g.id}>{g.name_th}</MenuItem>
                                    ))}
                                </Select>
                            </div>

                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-wrap -m-2">
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>รูปแบบการค้นหา</InputLabel>
                                <Select displayEmpty value={sDirection} onChange={(e) => setSDirection(e.target.value as unknown as string)}>
                                    <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
                                    {searchType.map(g => (
                                        <MenuItem key={g.id} value={g.value}>{g.label}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            {/* วันที่สร้างข้อมูล */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่เริ่มต้น</InputLabel>
                                <DateTimePicker sx={{ width: '100%' }} value={sStartDate} onChange={setSStartDate} />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่สิ้นสุด</InputLabel>
                                <DateTimePicker sx={{ width: '100%' }} value={sEndDate} onChange={setSEndDate} />
                            </div>

                        </div>
                        {/* ปุ่มค้นหา */}
                        <div className="w-full flex justify-end gap-2 p-2">
                            <Button
                                variant="outlined"
                                startIcon={<CancelOutlinedIcon />}
                                className="!border-gray-400 !text-gray-600 hover:!bg-gray-100"
                                onClick={handleClearFilter}
                            >
                                Clear
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                className="!bg-primary hover:!bg-primary-dark"
                                onClick={() => handleSearch()}
                            >
                                ค้นหา
                            </Button>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <Button
                    variant="outlined"
                    className="!border-gold !text-primary"
                    size="small"
                    startIcon={<img src="/icons/txt-file.png" />}
                    onClick={() => exportData(prepareExportRows(rows), "txt", "car_in/out_list")}
                >
                    TXT
                </Button>
                <Button
                    variant="outlined"
                    className="!border-gold !text-primary"
                    size="small"
                    startIcon={<img src="/icons/xls-file.png" />}
                    onClick={() => exportData(prepareExportRows(rows), "xlsx", "car_in/out_list")}
                >
                    XLS
                </Button>
                <Button
                    variant="outlined"
                    className="!border-gold !text-primary"
                    size="small"
                    startIcon={<img src="/icons/csv-file.png" />}
                    onClick={() => exportData(prepareExportRows(rows), "csv", "car_in/out_list")}
                >
                    CSV
                </Button>
                <Button
                    variant="outlined"
                    className='!border-gold !text-primary'
                    size="small"
                    startIcon={<img src='/icons/pdf-file.png' />}
                    onClick={() => {
                        // 👉 process rows ก่อน export
                        const processedRows = rows.map((r, i) => ({
                            ...r,
                            licensePlate: `${r.plate || ""} ${r.region_th || ""}`,
                            name: `${r.member_firstname || ""} ${r.member_lastname || ""}`,
                            datetime_out: r.datetime_out ? dayjs(r.datetime_out).format("DD/MM/YYYY HH:mm:ss") : "",
                            datetime_in: r.datetime_in ? dayjs(r.datetime_in).format("DD/MM/YYYY HH:mm:ss") : "",
                        }));

                        exportData(processedRows, "pdf", "car_in/out_list", columnsExport);
                    }}
                >
                    PDF
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                    ผลการค้นหา : {rowCount} รายการ
                </Typography>
            </Stack>

            <DataTable
                getRowId={(row) => row.id}
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                rowCount={rowCount}
                onPaginationModelChange={handlePaginationChange}
            />
        </Box>
    );
};

export default SearchCar;