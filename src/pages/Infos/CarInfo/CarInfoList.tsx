// src/pages/CarInfo/CarInfoList.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Chip, Stack, InputLabel, IconButton, Dialog, DialogContent, DialogTitle, Checkbox, FormControlLabel, Autocomplete } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from '../../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ChipTag from '../../../components/ChipTag';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../store';
import {
    selectRegions, fetchLprRegions,
    selectVehicleMakes, fetchVehicleMakes,
    selectVehicleColors, fetchVehicleColors,
    selectVehicleGroups, fetchVehicleGroups,
} from '../../../store/slices/masterdataSlice';
import { getVehicleModels, type VehicleModel } from '../../../services/masterdata.service';
import VehicleApi from '../../../services/VehicleApi.service';
import dialog from '../../../services/dialog.service';
import dayjs, { Dayjs } from 'dayjs';
import type { Vehicle, VehicleListFilter } from '../../../services/VehicleApi.service';



// --- Mock Data ---
// const rows = [
//     { id: 1, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Visitor' },
//     { id: 2, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
//     { id: 3, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Visitor' },
//     { id: 4, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
//     { id: 5, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
//     { id: 6, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'VIP' },
//     { id: 7, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
//     { id: 8, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Blacklist' },
// ];

const DEFAULT_CREATOR_UID = '83f04e2b-09c8-40c2-83d2-cafb57742e21';
const DEFAULT_UPDATER_UID = '83f04e2b-09c8-40c2-83d2-cafb57742e21';

const CarInfoList = () => {
    // ====== Search form states (ด้านบน accordion) ======
    const [sPlatePrefix, setSPlatePrefix] = useState<string>('');
    const [sPlateNumber, setSPlateNumber] = useState<string>('');
    const [sRegionCode, setSRegionCode] = useState<string>('');
    const [sVehicleMake, setSVehicleMake] = useState<string>(''); // เก็บค่า text
    const [sVehicleMakeInput, setSVehicleMakeInput] = useState<string>(''); // ใช้ควบคุม input
    const [sVehicleColorId, setSVehicleColorId] = useState<number | ''>('');
    const [sVehicleGroupId, setSVehicleGroupId] = useState<number | ''>('');
    const [sStartDate, setSStartDate] = useState<Dayjs | null>(null);
    const [sEndDate, setSEndDate] = useState<Dayjs | null>(null);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    // ✅ state เก็บ filter ล่าสุด
    const [lastFilter, setLastFilter] = useState<VehicleListFilter>({});

    const [rows, setRows] = useState<Vehicle[]>([]);

    const [isCarFormOpen, setIsCarFormOpen] = useState(false);
    const handleOpenCarForm = () => setIsCarFormOpen(true);
    const handleCloseCarForm = () => {
        resetForm();
        setIsCarFormOpen(false);
    };

    const dispatch = useDispatch<AppDispatch>();

    // 🔹 ใช้ selectors
    const regions = useSelector(selectRegions);
    const makes = useSelector(selectVehicleMakes);
    const colors = useSelector(selectVehicleColors);
    const groups = useSelector(selectVehicleGroups);

    // 🔹 โหลด master data ตอนเข้า page
    useEffect(() => {
        dispatch(fetchLprRegions());
        dispatch(fetchVehicleMakes());
        dispatch(fetchVehicleColors());
        dispatch(fetchVehicleGroups());
    }, [dispatch]);


    // =========================
    // Dialog Form State
    // =========================
    // ทะเบียน
    const [platePrefix, setPlatePrefix] = useState<string>(''); // หมวดอักษร
    const [plateNumber, setPlateNumber] = useState<string>(''); // เลขทะเบียน
    // จังหวัด (payload ควรเป็น region_code: string)
    // หมายเหตุ: ถ้าใน regions ไม่มี code ให้เก็บ name_th ชั่วคราวหรือ map เป็นโค้ดก่อนส่งจริง
    const [regionCode, setRegionCode] = useState<string>('');

    // ✅ ยี่ห้อ/รุ่น: ใช้ Autocomplete แต่ "เก็บเป็นข้อความ"
    const [vehicleMakeText, setVehicleMakeText] = useState<string>('');   // เก็บ string
    const [vehicleModelText, setVehicleModelText] = useState<string>(''); // เก็บ string

    // อนุญาตเฉพาะ ENG + ตัวเลข (ห้าม space/พิเศษ)
    const ALNUM = /^[A-Za-z0-9]+$/;
    const sanitizeAlnum = (s: string) => s.replace(/[^A-Za-z0-9]/g, '');

    const allowKeys = new Set([
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'Tab', 'Enter'
    ]);

    // error states
    const [makeError, setMakeError] = useState<string>('');
    const [modelError, setModelError] = useState<string>('');

    // สำหรับควบคุมข้อความที่อยู่ในกล่อง Autocomplete (แยกจาก value)
    const [makeInput, setMakeInput] = useState<string>('');
    const [modelInput, setModelInput] = useState<string>('');

    // ภายในยังคงต้องใช้ makeId เพื่อดึง models ตามยี่ห้อ
    const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);

    // สี / กลุ่ม (id)
    const [vehicleColorId, setVehicleColorId] = useState<number | ''>('');
    const [vehicleGroupId, setVehicleGroupId] = useState<number | ''>('');

    // สถานะ
    const [active, setActive] = useState<boolean>(true);     // Checkbox ใน UI เป็น "Inactive" → map กลับเป็น active
    const [visible] = useState<boolean>(true);               // ถ้าต้องมี toggle เพิ่ม UI ได้

    // หมายเหตุ
    const [notes, setNotes] = useState<string>('');

    // ผู้บันทึก/แก้ไข (แสดงเฉยๆ ในตัวอย่างนี้)
    const [creatorUid] = useState<string>(DEFAULT_CREATOR_UID);
    const [updaterUid] = useState<string>(DEFAULT_UPDATER_UID);

    // =========================
    // โหลด models ตาม selectedMakeId (ไม่เก็บลง Redux)
    // =========================
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);

    const [platePrefixError, setPlatePrefixError] = useState<string>('');
    const [plateNumberError, setPlateNumberError] = useState<string>('');
    const [regionError, setRegionError] = useState<string>('');
    const [colorError, setColorError] = useState<string>('');
    const [groupError, setGroupError] = useState<string>('');

    // ✅ ฟังก์ชันดึงข้อมูล
    const fetchData = async (page: number, pageSize: number, filter: VehicleListFilter) => {
        try {
            const res = await VehicleApi.list(
                page + 1, // API เริ่มนับจาก 1
                pageSize,
                'uid.asc',
                filter
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

    useEffect(() => {
        if (!selectedMakeId) {
            setModels([]);
            return;
        }
        (async () => {
            setModelsLoading(true);
            setModelsError(null);
            try {
                const res = await getVehicleModels(Number(selectedMakeId), 1000);
                setModels(res.data ?? []);
            } catch (e: any) {
                setModelsError(e?.message || 'โหลดรุ่นรถไม่สำเร็จ');
            } finally {
                setModelsLoading(false);
            }
        })();
    }, [selectedMakeId]);



    // options สำหรับ Autocomplete
    const makeOptions = useMemo(
        () =>
            makes.map(m => ({
                id: m.id as number,
                label: m.make_en as string, // แสดงภาษาไทย
            })),
        [makes]
    );

    const modelOptions = useMemo(
        () =>
            models.map(md => ({
                id: md.id as number,
                label: md.model_en || md.model || '', // ใช้อันที่มี
            })),
        [models]
    );
    // options ของยี่ห้อ
    const searchMakeOptions = useMemo(
        () =>
            makes.map(m => ({
                id: m.id as number,
                label: m.make_en as string, // ถ้าอยากโชว์ภาษาไทยก็เปลี่ยนเป็น m.make_th
            })),
        [makes]
    );

    //ฟังก์ชัน validate ก่อนบันทึก
    const validateRequired = () => {
        let ok = true;

        // ป้ายทะเบียน
        if (!platePrefix.trim()) { setPlatePrefixError('กรอกหมวดอักษร'); ok = false; } else setPlatePrefixError('');
        if (!plateNumber.trim()) { setPlateNumberError('กรอกเลขทะเบียน'); ok = false; } else setPlateNumberError('');

        // จังหวัด
        if (!regionCode) { setRegionError('เลือกจังหวัด'); ok = false; } else setRegionError('');

        // ยี่ห้อ/รุ่น (เฉพาะ ENG+ตัวเลข และไม่ว่าง) — ใช้ makeError/modelError ที่มีอยู่แล้วร่วมด้วย
        if (!vehicleMakeText || !ALNUM.test(vehicleMakeText)) {
            setMakeError('ยี่ห้อต้องเป็น A-Z/0-9 และห้ามว่าง');
            ok = false;
        }
        if (!vehicleModelText || !ALNUM.test(vehicleModelText)) {
            setModelError('รุ่นต้องเป็น A-Z/0-9 และห้ามว่าง');
            ok = false;
        }

        // สี
        if (vehicleColorId === '') { setColorError('เลือกสี'); ok = false; } else setColorError('');

        // กลุ่มรถ
        if (vehicleGroupId === '') { setGroupError('เลือกกลุ่มรถ'); ok = false; } else setGroupError('');

        return ok;
    };

    // =========================
    // บันทึกฟอร์ม → สร้าง payload ตามสเปค
    // =========================
    const handleSubmit = async () => {
        if (!validateRequired()) return; // ❌ ไม่ผ่านก็ไม่บันทึก
        dialog.loading();
        // แปลงค่าจาก UI เป็น payload
        const payload = {
            uid: '', // ใช้เฉพาะตอนอัปเดต (ตามที่เคยแจ้ง), ตอนสร้างปล่อยว่างหรือไม่ส่ง
            plate_prefix: platePrefix || '',
            plate_number: plateNumber || '',
            region_code: regionCode || '', // NOTE: ถ้ามี code ที่แท้จริงควรใช้ code นั้น
            vehicle_make: vehicleMakeText || '',   // ✅ เก็บเป็นข้อความ
            vehicle_model: vehicleModelText || '', // ✅ เก็บเป็นข้อความ
            vehicle_color_id: vehicleColorId === '' ? null : Number(vehicleColorId),
            active: active,     // true = ใช้งานอยู่
            visible: visible,   // ถ้าทำเป็น toggle ให้เพิ่ม UI
            notes: notes || '',
            vehicle_group_id: vehicleGroupId === '' ? null : Number(vehicleGroupId),
            creator_uid: creatorUid,
            updater_uid: updaterUid,
        };

        try {

            const res = await VehicleApi.create(payload);
            if (res.success) {
                dialog.success('บันทึกสำเร็จ')
                resetForm();
                setIsCarFormOpen(false);
            } else {
                console.error('⚠️ Create failed:', res.message);
                dialog.close();
            }
        } catch (err: any) {
            dialog.close();
            console.error('❌ API error:', err.message || err);
        }

        // ปิด dialog หลังบันทึกสำเร็จ
        resetForm();
        handleCloseCarForm();
    };


    const handleKeyDownAlnum: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        // อนุญาตปุ่มควบคุม
        if (allowKeys.has(e.key)) return;
        // บล็อค space และทุกอย่างที่ไม่ใช่ [A-Za-z0-9]
        if (e.key === ' ' || !/^[A-Za-z0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handlePasteAlnum: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
        const text = e.clipboardData.getData('text');
        if (!ALNUM.test(text)) {
            e.preventDefault(); // กัน paste ที่ไม่ตรง pattern
        }
    };
    const resetForm = () => {
        setPlatePrefix('');
        setPlateNumber('');
        setRegionCode('');
        setVehicleMakeText('');
        setVehicleModelText('');
        setMakeInput('');
        setModelInput('');
        setVehicleColorId('');
        setVehicleGroupId('');
        setActive(true);
        setNotes('');

        // clear error states
        setPlatePrefixError('');
        setPlateNumberError('');
        setRegionError('');
        setMakeError('');
        setModelError('');
        setColorError('');
        setGroupError('');
    };

    // เรียก search
    // ✅ กดปุ่มค้นหา → reset pagination + ยิง API
    const handleSearch = () => {
        const filter = buildVehicleFilter();
        setLastFilter(filter);
        const newPagination = { page: 0, pageSize: paginationModel.pageSize };
        setPaginationModel(newPagination);
        fetchData(newPagination.page, newPagination.pageSize, filter); // ⬅️ ยิง API
    };

    // ✅ pagination เปลี่ยน → ยิง API
    const handlePaginationChange = (model: { page: number; pageSize: number }) => {
        setPaginationModel(model);
        fetchData(model.page, model.pageSize, lastFilter); // ⬅️ ยิง API
    };

    // helper: สร้าง filter object ที่ส่งเฉพาะ key ที่มีค่า
    const buildVehicleFilter = (): VehicleListFilter => {
        const filter: VehicleListFilter = {};
        if (sPlatePrefix) filter.plate_prefix = sPlatePrefix.trim();
        if (sPlateNumber) filter.plate_number = sPlateNumber.trim();
        if (sRegionCode) filter.region_code = sRegionCode;

        if (sVehicleMake) filter.vehicle_make = sVehicleMake.trim();
        if (sVehicleColorId !== '' && sVehicleColorId !== null) filter.vehicle_color_id = Number(sVehicleColorId);
        if (sVehicleGroupId !== '' && sVehicleGroupId !== null) filter.vehicle_group_id = Number(sVehicleGroupId);

        // created_at range: startOf day / endOf day
        if (sStartDate) filter.created_at_gte = sStartDate.startOf('day').toISOString();
        if (sEndDate) filter.created_at_lte = sEndDate.endOf('day').toISOString();

        return filter;
    };

    // --- Table Columns Definition ---
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
            field: 'plate', headerName: 'ทะเบียนรถ', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <Typography variant='body2'>{params.row.plate_prefix}{params.row.plate_number}</Typography>
                </div>
            )
        },
        {
            field: 'province', headerName: 'หมวดจังหวัด', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <Typography variant='caption'>{params.row.region ? params.row.region.name_th : '-'}</Typography>
                </div>
            )
        },
        { field: 'vehicle_make', headerName: 'ยี่ห้อ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'vehicle_model', headerName: 'รุ่นรถ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
        {
            field: 'vehicle_color_id', headerName: 'สี', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <Typography variant='caption'>{params.row.vehicle_color.color_th ?? '-'}</Typography>
                </div>
            )
        },
        { field: 'createDate', headerName: 'วันที่สร้าง', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
        {
            field: 'group',
            headerName: 'กลุ่มรถ',
            flex: 1,
            minWidth: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <ChipTag tag={params.row.vehicle_group.name_en ?? '-'} />
                </div>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 100,
            sortable: false,
            align: 'center',
            renderCell: () => (
                <div className='flex w-full h-full items-center justify-center gap-1'>
                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
                </div>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
                ข้อมูลรถ
            </Typography>
            {/* The page title is now in the Navbar, so we can remove it from here */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>Search</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'white' }}>
                    <div className="flex flex-col gap-4">
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
                                    value={
                                        sVehicleMake
                                            ? searchMakeOptions.find(o => o.label === sVehicleMake) ?? { id: 0, label: sVehicleMake }
                                            : null
                                    }
                                    inputValue={sVehicleMakeInput}
                                    onInputChange={(_, newInput) => {
                                        setSVehicleMakeInput(newInput);
                                        setSVehicleMake(newInput); // เก็บ text สำหรับ filter
                                    }}
                                    onChange={(_, newValue) => {
                                        const label = typeof newValue === 'string'
                                            ? newValue
                                            : (newValue?.label ?? '');
                                        setSVehicleMake(label);
                                        setSVehicleMakeInput(label);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="เช่น TOYOTA, HONDA"
                                        />
                                    )}
                                    getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label ?? '')}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                />
                            </div>
                            {/* สี */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>สี</InputLabel>
                                <Select
                                    value={sVehicleColorId}
                                    onChange={(e) => setSVehicleColorId(e.target.value as unknown as number | '')}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>ทุกสี</em></MenuItem>
                                    {colors.map(c => (
                                        <MenuItem key={c.id} value={c.id}>{c.color_th}</MenuItem>
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
                                    <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                    {groups.map(g => (
                                        <MenuItem key={g.id} value={g.id}>{g.name_th}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            {/* วันที่สร้างข้อมูล */}
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (เริ่มต้น)</InputLabel>
                                <DatePicker value={sStartDate} onChange={setSStartDate} />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (สิ้นสุด)</InputLabel>
                                <DatePicker value={sEndDate} onChange={setSEndDate} />
                            </div>
                        </div>
                        {/* ปุ่มค้นหา */}
                        <div className="w-full flex justify-end p-2">
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                className='!bg-primary hover:!bg-primary-dark'
                                onClick={handleSearch}
                            >
                                ค้นหา
                            </Button>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <Button variant="contained" size="small" startIcon={<AddIcon />} className='!bg-gold hover:!bg-gold-dark' onClick={handleOpenCarForm}>ทะเบียนรถ</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/txt-file.png' />}>TXT</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/xls-file.png' />}>XLS</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/csv-file.png' />}>CSV</Button>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>ผลการค้นหา : 10 รายการ</Typography>
            </Stack>

            <DataTable
                getRowId={(row) => row.uid}
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                rowCount={rowCount}
                // onPaginationModelChange={(model) => {
                //     setPaginationModel(model); // เก็บ state
                //     console.log('👉 page:', model.page, 'limit:', model.pageSize);
                //     // ถ้าต้องการไปยิง API
                //     // loadData(model.page + 1, model.pageSize);
                // }}
                onPaginationModelChange={handlePaginationChange}
            />

            {/* --- JSX for the Add/Edit Car Popup --- */}
            <Dialog open={isCarFormOpen} onClose={handleCloseCarForm} fullWidth maxWidth="lg" sx={{ gap: 0 }}>
                <DialogTitle sx={{ padding: 0 }}>
                    <div className='w-full h-[60px] flex '>
                        <div className=' flex w-[55%] h-full bg-primary text-white items-center ps-6'>
                            <Typography variant='h5' >ข้อมูลทะเบียนรถ</Typography>
                        </div>
                        <div className='w-[45%]  flex justify-end p-1'>
                            <IconButton size='small' className='h-[30px]' onClick={handleCloseCarForm}> <CancelOutlinedIcon /> </IconButton>

                        </div>
                    </div>

                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#000000', padding: 0, borderTop: 0 }}>
                    <div className="flex flex-wrap lg:flex-nowrap  ">
                        {/* Left Column */}
                        <div className="w-full lg:w-[55%] flex flex-col gap-6 bg-primary p-4 ">
                            <div className='flex gap-2'>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>เลขทะเบียน</InputLabel>
                                    <div className="flex gap-2">
                                        <TextField
                                            placeholder="หมวดอักษร"
                                            value={platePrefix}
                                            onChange={(e) => setPlatePrefix(e.target.value)}
                                            error={!!platePrefixError}
                                            helperText={platePrefixError || 'เช่น กง / ผก / ฆย'}
                                        />
                                        <TextField
                                            placeholder="เลขทะเบียน"
                                            value={plateNumber}
                                            onChange={(e) => setPlateNumber(e.target.value)}
                                            error={!!plateNumberError}
                                            helperText={plateNumberError}
                                        />
                                    </div>
                                </div>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>หมวดจังหวัด *</InputLabel>
                                    <Select
                                        value={regionCode}
                                        onChange={(e) => setRegionCode(e.target.value as string)}
                                        displayEmpty
                                        error={!!regionError}
                                    >
                                        <MenuItem value=""><em>เลือกจังหวัด</em></MenuItem>
                                        {regions.map(r => (
                                            // NOTE: ถ้ามี r.code ให้เปลี่ยน value เป็น r.code
                                            <MenuItem key={r.id} value={r.region_code}>{r.name_th}</MenuItem>
                                        ))}
                                    </Select>
                                    {regionError && <Typography variant="caption" color="error">{regionError}</Typography>}
                                </div>
                            </div>
                            {/* ยี่ห้อ (Autocomplete, เก็บเป็น text) + รุ่น (Autocomplete, เก็บเป็น text) */}
                            <div className='flex gap-2'>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>ยี่ห้อ</InputLabel>
                                    <Autocomplete
                                        // freeSolo
                                        options={makeOptions}
                                        value={
                                            vehicleMakeText
                                                ? makeOptions.find(o => o.label === vehicleMakeText) ?? { id: 0, label: vehicleMakeText }
                                                : null
                                        }
                                        inputValue={makeInput}
                                        onInputChange={(_, newInput) => {
                                            const sanitized = sanitizeAlnum(newInput).toUpperCase();
                                            setMakeInput(sanitized);
                                            setVehicleMakeText(sanitized);
                                            // validate live
                                            if (sanitized.length === 0) {
                                                setMakeError('กรอก A-Z/0-9 เท่านั้น (ห้ามว่าง)');
                                            } else if (!ALNUM.test(sanitized)) {
                                                setMakeError('อนุญาตเฉพาะ A-Z/0-9 (ห้ามเว้นวรรค/อักขระพิเศษ)');
                                            } else {
                                                setMakeError('');
                                            }
                                        }}
                                        onChange={(_, newValue) => {
                                            const label = typeof newValue === 'string'
                                                ? newValue
                                                : (newValue?.label ?? '');
                                            const sanitized = sanitizeAlnum(label);
                                            setVehicleMakeText(sanitized);
                                            setMakeInput(sanitized);
                                            setMakeError(sanitized && ALNUM.test(sanitized) ? '' : 'อนุญาตเฉพาะ A-Z/0-9');
                                            // map make → id เพื่อโหลดรุ่น
                                            const id = typeof newValue === 'object' && newValue ? (newValue as any).id : null;
                                            setSelectedMakeId(id ?? null);
                                            setVehicleModelText('');
                                            setModelInput('');
                                            setModelError('');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="ยี่ห้อ (ENG/ตัวเลขเท่านั้น)"
                                                error={!!makeError}
                                                helperText={makeError || 'เช่น TOYOTA, HONDA, FORD'}
                                                onKeyDown={handleKeyDownAlnum}
                                                onPaste={handlePasteAlnum}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    inputMode: 'text',      // ✅ แทน 'latin'
                                                    autoCapitalize: 'none', // ป้องกันมือถือแปลงตัวอักษร
                                                    autoCorrect: 'off',     // กัน auto-correct บางคีย์บอร์ด
                                                    spellCheck: 'false',    // กัน spellcheck ใต้เส้นแดง
                                                }}
                                            />
                                        )}
                                        getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label ?? '')}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                    />
                                </div>

                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>รุ่น</InputLabel>
                                    <Autocomplete
                                        // freeSolo
                                        options={modelOptions}
                                        disabled={!vehicleMakeText}
                                        value={
                                            vehicleModelText
                                                ? modelOptions.find(o => o.label === vehicleModelText) ?? { id: 0, label: vehicleModelText }
                                                : null
                                        }
                                        inputValue={modelInput}
                                        onInputChange={(_, newInput) => {
                                            const sanitized = sanitizeAlnum(newInput).toUpperCase();

                                            setModelInput(sanitized);
                                            setVehicleModelText(sanitized);
                                            if (sanitized.length === 0) {
                                                setModelError('กรอก A-Z/0-9 เท่านั้น (ห้ามว่าง)');
                                            } else if (!ALNUM.test(sanitized)) {
                                                setModelError('อนุญาตเฉพาะ A-Z/0-9 (ห้ามเว้นวรรค/อักขระพิเศษ)');
                                            } else {
                                                setModelError('');
                                            }
                                        }}
                                        onChange={(_, newValue) => {
                                            const label = typeof newValue === 'string'
                                                ? newValue
                                                : (newValue?.label ?? '');
                                            const sanitized = sanitizeAlnum(label);
                                            setVehicleModelText(sanitized);
                                            setModelInput(sanitized);
                                            setModelError(sanitized && ALNUM.test(sanitized) ? '' : 'อนุญาตเฉพาะ A-Z/0-9');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={modelsLoading ? 'กำลังโหลด...' : 'รุ่น (ENG/ตัวเลขเท่านั้น)'}
                                                error={!!modelError}
                                                helperText={modelError || (modelsError ? 'โหลดรุ่นไม่สำเร็จ' : 'เช่น CIVIC, COROLLA, X5')}
                                                onKeyDown={handleKeyDownAlnum}
                                                onPaste={handlePasteAlnum}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    inputMode: 'text',      // ✅ แทน 'latin'
                                                    autoCapitalize: 'none', // ป้องกันมือถือแปลงตัวอักษร
                                                    autoCorrect: 'off',     // กัน auto-correct บางคีย์บอร์ด
                                                    spellCheck: 'false',    // กัน spellcheck ใต้เส้นแดง
                                                }}
                                            />
                                        )}
                                        getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label ?? '')}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                    />
                                </div>
                            </div>

                            {/* สี + สถานะ */}
                            <div className='flex gap-2'>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>สี</InputLabel>
                                    <Select
                                        value={vehicleColorId}
                                        onChange={(e) => setVehicleColorId(e.target.value as unknown as number | '')}
                                        displayEmpty
                                        error={!!colorError}
                                    >
                                        <MenuItem value=""><em>ทุกสี</em></MenuItem>
                                        {colors.map(c => (
                                            <MenuItem key={c.id} value={c.id}>{c.color_th}</MenuItem>
                                        ))}
                                    </Select>
                                    {colorError && <Typography variant="caption" color="error">{colorError}</Typography>}
                                </div>

                                <div className='w-1/2 pt-5'>
                                    {/* Checkbox แสดงเป็น "Inactive" แต่เราจะ map กลับเป็น active */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={!active}
                                                onChange={(e) => setActive(!e.target.checked)}
                                                sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                            />
                                        }
                                        label={<Typography sx={{ color: 'white' }}>Inactive</Typography>}
                                    />
                                </div>
                            </div>

                            {/* หมายเหตุ */}
                            <div>
                                <InputLabel shrink className='!text-white'>หมายเหตุ</InputLabel>
                                <TextField
                                    multiline
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-full lg:w-[45%] flex flex-col gap-4  bg-white p-4">
                            <div className='card border-[1px]'>
                                <InputLabel required shrink>กลุ่มรถ</InputLabel>
                                <Select
                                    value={vehicleGroupId}
                                    onChange={(e) => setVehicleGroupId(e.target.value as unknown as number | '')}
                                    displayEmpty
                                    error={!!groupError}
                                >
                                    <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                    {groups.map(g => (
                                        <MenuItem key={g.id} value={g.id}>{g.name_th}</MenuItem>
                                    ))}
                                </Select>
                                {groupError && <Typography variant="caption" color="error">{groupError}</Typography>}
                            </div>
                            {/* Record Details */}
                            <div>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>รายละเอียดการบันทึก</Typography>
                                <div className='flex flex-col w-full gap-5'>
                                    <div className='flex gap-3'>
                                        <div className="flex flex-col items-start gap-1 w-1/2">
                                            <InputLabel shrink sx={{ width: '120px' }}>ผู้บันทึกข้อมูล</InputLabel>
                                            <TextField disabled fullWidth />
                                        </div>
                                        <div className="flex flex-col items-start gap-1 w-1/2">
                                            <InputLabel shrink sx={{ width: '120px' }}>วันที่บันทึกข้อมูล</InputLabel>
                                            <DateTimePicker disabled />
                                        </div>
                                    </div>
                                    <div className='flex  gap-3'>
                                        <div className="flex flex-col items-start gap-1 w-1/2">
                                            <InputLabel shrink sx={{ width: '120px' }}>ผู้แก้ไขข้อมูล</InputLabel>
                                            <TextField disabled fullWidth />
                                        </div>
                                        <div className="flex flex-col items-start gap-1 w-1/2">
                                            <InputLabel shrink sx={{ width: '120px' }}>วันที่แก้ไขข้อมูล</InputLabel>
                                            <DateTimePicker disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex w-full justify-end gap-3 py-5 border-t-primary-dark border-t-[1px] mt-3'>

                                <Button
                                    variant="outlined"
                                    className='!border-primary !text-primary'
                                    onClick={handleCloseCarForm}
                                    startIcon={<CloseIcon />}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    startIcon={<SaveIcon />}
                                    className="!bg-primary hover:!bg-primary-dark"
                                >
                                    บันทึก
                                </Button>

                            </div>
                        </div>
                    </div>
                </DialogContent>

            </Dialog >
        </Box >
    );
};

export default CarInfoList;