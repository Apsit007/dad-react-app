// src/pages/PersonInfo/PersonInfoForm.tsx
import { Paper, Typography, Box, TextField, Select, MenuItem, Button, Avatar, FormControlLabel, InputLabel, Checkbox, Accordion, AccordionDetails, AccordionSummary, Autocomplete, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '../../../components/DataTable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import { type GridColDef } from '@mui/x-data-grid';
import EditSquareIcon from "@mui/icons-material/EditSquare"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import { useEffect, useMemo, useRef, useState } from 'react';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import dialog from '../../../services/dialog.service';
import Popup from '../../../components/Popup';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { selectGenders, selectMemberGroups, selectPersonTitles, selectRegions, selectVehicleColors, selectVehicleMakes } from '../../../store/slices/masterdataSlice';
import { MemberApi, type MemberPayload } from '../../../services/Member.service';
import dayjs from 'dayjs';
import { VehicleApi, type Vehicle, type VehicleListFilter } from '../../../services/VehicleApi.service';
import FileUploadApi from '../../../services/FileUpload.service';
import { DepartmentApi, type Department } from '../../../services/Department.service';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteIcon from "@mui/icons-material/Delete";





const PersonInfoForm = () => {
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const authUid = useSelector((state: RootState) => state.auth.user.uid);
    const currentUid = authUid ?? '';
    // state สำหรับ form
    const [form, setForm] = useState<MemberPayload>({
        title: "",
        gender: "",
        firstname: "",
        lastname: "",
        idcard: "",
        dob: "",
        phone: "",
        email: "",
        dep_uid: "",
        emp_card_id: "",
        image_url: "",
        member_status: "active",
        notes: "",
        creator_uid: currentUid,
        updater_uid: currentUid,
        member_group_id: 0,
        card_code: "",
        card_number: "",
        vehicle_uid_list: "",
        active: true,
        visible: true,
        deleted: false,
        start_date: "",
        end_date: "",
    });

    // ✅ เช็คสถานะ terminate
    const isTerminated = form.member_status === "terminated";
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- table data ---
    const [popupCarRows, setPopupCarRows] = useState<Vehicle[]>([]);
    const [carRows, setCarRows] = useState<Vehicle[]>([]);
    const [rowCount, setRowCount] = useState(0);

    const [selectedCars, setSelectedCars] = useState<string[]>([]);

    // state เก็บ filter
    const [search, setSearch] = useState<VehicleListFilter>({
        plate_prefix: "",
        plate_number: "",
        region_code: "",
        vehicle_make: "",
        vehicle_color_id: undefined,
    });
    // --- pagination state ---
    const [paginationModel, setPaginationModel] = useState({
        page: 0, // DataGrid ใช้ 0-based
        pageSize: 10,
    });

    const [isCarPopupOpen, setIsCarPopupOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const personTitles = useSelector(selectPersonTitles);
    const genders = useSelector(selectGenders);
    const memberGroups = useSelector(selectMemberGroups);

    const regions = useSelector(selectRegions);
    const vehicleColors = useSelector(selectVehicleColors);
    const vehicleMakes = useSelector(selectVehicleMakes);

    const [departmentList, setDepartmentList] = useState<Department[]>([])


    // 👉 โหลดข้อมูลถ้าเป็นโหมดแก้ไข
    useEffect(() => {
        if (uid) {
            console.log(uid);
            MemberApi.getById(uid).then((res) => {
                if (res.success && res.data) {
                    const person = res.data[0];
                    setForm(person);

                    // ✅ ถ้ามี image_url ให้โชว์ที่ preview
                    if (person.image_url) {
                        setSelectedImage(person.image_url);
                    }
                    setCarRows(person.vehicles)
                }
            });
        }
    }, [uid]);

    // เมื่อเปิด popup ให้ sync กับ carRows
    useEffect(() => {
        if (isCarPopupOpen) {
            setSelectedCars(carRows.map((c) => c.uid)); // uid ที่มีอยู่แล้วใน cartable
        }
    }, [isCarPopupOpen, carRows]);

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const res = await DepartmentApi.list(
                    1,
                    1000
                );
                setDepartmentList(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        loadDepartments();
    }, [])

    // toggle checkbox
    const handleToggleCar = (uid: string) => {
        setSelectedCars((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
        );
    };

    // เมื่อกดปุ่ม "เลือก"
    const handleConfirmCars = () => {
        const selectedRows = popupCarRows.filter((car) =>
            selectedCars.includes(car.uid)
        );

        // รวมกับ carRows ที่มีอยู่ (กันซ้ำด้วย uid)
        const merged = [...carRows];
        selectedRows.forEach((row) => {
            if (!merged.find((c) => c.uid === row.uid)) {
                merged.push(row);
            }
        });
        setCarRows(merged);
        setIsCarPopupOpen(false);
    };

    // โหลดข้อมูล
    const loadData = async (
        page: number = paginationModel.page + 1,
        pageSize: number = paginationModel.pageSize,
        filter: VehicleListFilter = search
    ) => {
        try {
            const res = await VehicleApi.list(page, pageSize, "uid.asc", filter);
            setPopupCarRows(res.data || []);
            setRowCount(res.pagination?.countAll ?? 0);
        } catch (err) {
            console.error("Load vehicle error:", err);
        }
    };


    const onPickFile = () => fileInputRef.current?.click();


    const validateFile = (file: File) => {
        const isValidType = ['image/png', 'image/jpeg'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) { dialog.warning('อนุญาตเฉพาะไฟล์ PNG หรือ JPEG'); return false; }
        if (!isValidSize) { dialog.warning('ขนาดไฟล์ต้องไม่เกิน 5MB'); return false; }
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!validateFile(file)) return;
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setSelectedImage(previewUrl);

    };

    const handleOpenCarPopup = () => {
        setIsCarPopupOpen(true);
    };

    const handleCloseCarPopup = () => {
        setIsCarPopupOpen(false);
    };

    const handleChange = (field: keyof MemberPayload, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // ฟังก์ชันตรวจสอบเลขบัตรประชาชน
    const isValidThaiIdCard = (id: string): boolean => {
        if (!/^\d{13}$/.test(id)) return false; // ต้องเป็นตัวเลข 13 หลัก
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += Number(id.charAt(i)) * (13 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === Number(id.charAt(12));
    };

    const isValidPhone = (phone: string): boolean => {
        return /^0\d{9}$/.test(phone); // 0 ตามด้วยตัวเลข 9 หลัก = รวม 10 หลัก
    };

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.title) newErrors.title = "กรุณาเลือกคำนำหน้า";
        if (!form.firstname) newErrors.firstname = "กรุณากรอกชื่อ";
        if (!form.lastname) newErrors.lastname = "กรุณากรอกนามสกุล";
        if (!form.gender) newErrors.gender = "กรุณาเลือกเพศ";

        if (!form.idcard) {
            newErrors.idcard = "กรุณากรอกเลขบัตรประชาชน";
        } else if (!isValidThaiIdCard(form.idcard)) {
            newErrors.idcard = "เลขบัตรประชาชนไม่ถูกต้อง";
        }

        if (!form.phone) {
            newErrors.phone = "กรุณากรอกเบอร์โทร";
        } else if (!isValidPhone(form.phone)) {
            newErrors.phone = "เบอร์โทรต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0";
        }

        if (form.email && !isValidEmail(form.email)) {
            newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }

        if (!form.start_date) newErrors.start_date = "กรุณาเลือกวันที่เริ่มต้น";
        if (!form.end_date) newErrors.end_date = "กรุณาเลือกวันที่สิ้นสุด";
        if (!form.dob) newErrors.dob = "กรุณาเลือกวันเกิด";

        // ✅ ต้องมีรถอย่างน้อย 1 คัน
        if (carRows.length === 0) {
            newErrors.vehicle_uid_list = "ต้องเพิ่มรถอย่างน้อย 1 คัน";
            dialog.error("เลือกรถอย่างน้อย 1 คัน")
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    // เวลา save
    const handleSave = async () => {
        dialog.loading();
        try {
            if (!validateForm()) {
                dialog.close()
                return; // ❌ ถ้าไม่ผ่าน หยุดเลย
            }

            // ✅ เตรียม vehicle_uid_list
            const vehicle_uid_list =
                carRows.length > 0 ? carRows.map((c) => c.uid).join(",") : "";

            let imageUrl = form.image_url;

            // ✅ อัปโหลดรูปถ้ามี
            if (selectedFile) {
                const uploadRes = await FileUploadApi.upload(selectedFile);
                if (uploadRes.success) {
                    imageUrl = uploadRes.data[0].url;
                } else {
                    dialog.error("อัปโหลดรูปภาพไม่สำเร็จ");
                    return;
                }
            }


            const payload: MemberPayload = {
                ...form,
                uid: uid || form.uid, // ✅ กรณี update ต้องมี uid
                image_url: imageUrl,
                vehicle_uid_list,
                creator_uid: form.creator_uid || currentUid,
                updater_uid: currentUid,
            };

            console.log("👉 payload", payload);
            let res;
            if (uid) {
                // ✅ update mode → uid อยู่ใน payload
                res = await MemberApi.update(payload);
            } else {
                // ✅ create mode
                res = await MemberApi.create(payload);
            }


            if (res.success) {
                dialog.success("บันทึกข้อมูลสำเร็จ");
                navigate("/info/person"); // ✅ redirect ไปหน้า info/person
            } else {
                dialog.error(res.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            console.error("Save error:", err);
            dialog.error("ไม่สามารถบันทึกข้อมูลได้");
        }
    };
    const handleBlackBtn = () => {
        navigate("/info/person");
    }

    const handleTerminateMember = async (uid: string) => {
        dialog.loading();
        try {
            if (!uid) return;
            const res = await MemberApi.terminate(uid);
            if (res.success) {
                dialog.success("บันทึกข้อมูลสำเร็จ");

                // ✅ reload ข้อมูลใหม่จาก API
                const reload = await MemberApi.getById(uid);
                if (reload.success && reload.data) {
                    const person = reload.data[0];
                    setForm(person);

                    // ✅ update preview image
                    if (person.image_url) {
                        setSelectedImage(person.image_url);
                    }
                    // ✅ update รถ
                    setCarRows(person.vehicles || []);
                }
            } else {
                dialog.error(res.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            console.error("Terminate error:", err);
            dialog.close();
        }
    };

    const handleRemoveCar = (uid: string) => {
        setCarRows((prev) => prev.filter((c) => c.uid !== uid));
    };

    const carColumns: GridColDef[] = [
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
        { field: 'region_name_th', headerName: 'หมวดจังหวัด', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center', },
        { field: 'vehicle_make', headerName: 'ยี่ห้อ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'vehicle_color_name_th', headerName: 'สี', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center', },
        {
            field: 'action',
            headerName: 'จัดการ',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveCar(params.row.uid)}
                    disabled={isTerminated}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )
        }
    ];


    const popupCarColumns: GridColDef[] = [
        {
            field: 'select',
            headerName: 'เลือก',
            width: 70,
            align: 'center', headerAlign: 'center',
            renderCell: (params) => <Checkbox
                checked={selectedCars.includes(params.row.uid)}
                onChange={() => handleToggleCar(params.row.uid)}
            />,
        },
        {
            field: 'plate', headerName: 'ทะเบียนรถ', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <Typography variant='body2'>{params.row.plate_prefix}{params.row.plate_number}</Typography>
                </div>
            )
        },
        { field: 'region_name_th', headerName: 'หมวดจังหวัด', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center', },
        { field: 'vehicle_make', headerName: 'ยี่ห้อ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'vehicle_color_name_th', headerName: 'สี', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center', },
    ];



    return (
        // Main container using Tailwind flexbox for columns
        <div className='flex flex-col'>
            <div className="flex flex-wrap lg:flex-nowrap gap-6">

                {/* Left Column */}
                <div className="w-full lg:w-6/12 flex flex-col gap-6">
                    {/* Person Info Card */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>ข้อมูลบุคคล</Typography>
                        <div className="flex flex-wrap -m-2">
                            {/* Avatar */}
                            <div className="w-full md:w-1/3 p-2">
                                <div className='relative'>
                                    <input ref={fileInputRef} type='file' accept='image/png,image/jpeg' className='hidden' onChange={handleFileChange} disabled={isTerminated} />
                                    <Box sx={{ position: 'relative', width: 220, height: 220 }} className='rounded-full border-[8px] border-gold' style={{ borderColor: '#E7B13A' }}>
                                        {selectedImage ? (
                                            <Avatar
                                                variant='circular'
                                                src={selectedImage}
                                                onClick={onPickFile}
                                                sx={{ width: '100%', height: '100%', cursor: 'pointer' }}
                                            />
                                        ) : (
                                            <Box
                                                role='button'
                                                onClick={onPickFile}
                                                className='flex flex-col items-center justify-center cursor-pointer bg-white rounded-full hover:bg-gray-50'
                                                sx={{ width: '100%', height: '100%' }}
                                            >
                                                <CloudUploadOutlinedIcon sx={{ color: 'text.disabled', fontSize: 42, mb: 1 }} />
                                                <Typography variant='body2' color='text.secondary'>50-100 Kb</Typography>
                                            </Box>
                                        )}

                                    </Box>

                                </div>
                                <div className="mt-2 text-center">
                                    {/* <FormControlLabel control={<Checkbox />} label="Inactive" /> */}
                                    <Typography>สถานะ : <span className={`${form.member_status != 'active' ? '!text-red-600s' : ''}`}>{form.member_status}</span></Typography>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="w-full md:w-2/3 p-2">
                                <div className="flex flex-wrap -m-2">
                                    {/* 🔹 คำนำหน้า */}
                                    <div className="w-full sm:w-[30%] p-2">
                                        <InputLabel shrink required>คำนำหน้า</InputLabel>
                                        <Select
                                            value={form.title}
                                            onChange={(e) => handleChange("title", e.target.value)}
                                            error={!!errors.title}
                                            disabled={isTerminated}
                                        >
                                            <MenuItem value=""><em>เลือกคำนำหน้า</em></MenuItem>
                                            {personTitles.map((t) => (
                                                <MenuItem key={t.id} value={t.title_th}>
                                                    {t.title_th}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink required>ชื่อ</InputLabel>
                                        <TextField
                                            value={form.firstname}
                                            onChange={(e) => handleChange("firstname", e.target.value)}
                                            error={!!errors.firstname}
                                            helperText={errors.firstname}
                                            disabled={isTerminated}
                                        />
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink required>นามสกุล</InputLabel>
                                        <TextField
                                            value={form.lastname}
                                            onChange={(e) => handleChange("lastname", e.target.value)}
                                            error={!!errors.lastname}
                                            helperText={errors.lastname}
                                            disabled={isTerminated}
                                        />
                                    </div>

                                    {/* 🔹 เพศ */}
                                    <div className="w-full sm:w-[30%] p-2">
                                        <InputLabel shrink required>เพศ</InputLabel>
                                        <Select
                                            value={form.gender}
                                            onChange={(e) => handleChange("gender", e.target.value)}
                                            error={!!errors.gender}
                                            disabled={isTerminated}
                                        >
                                            <MenuItem value=""><em>เลือกเพศ</em></MenuItem>
                                            {genders.map((g) => (
                                                <MenuItem key={g.id} value={g.name_th}>
                                                    {g.name_th}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink required>เลขที่บัตรประชาชน</InputLabel>
                                        <TextField
                                            value={form.idcard}
                                            onChange={(e) => handleChange("idcard", e.target.value)}
                                            error={!!errors.idcard}
                                            helperText={errors.idcard}
                                            disabled={isTerminated}
                                        />
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink>วันเกิด</InputLabel>
                                        <DatePicker
                                            value={form.dob ? dayjs(form.dob) : null}
                                            onChange={(date) =>
                                                handleChange("dob", date ? dayjs(date).format("YYYY-MM-DD") : "")
                                            }
                                            disabled={isTerminated}
                                            slotProps={{
                                                textField: {
                                                    error: !!errors.dob,
                                                    helperText: errors.dob,
                                                },
                                            }}

                                        />
                                    </div>

                                    <div className="w-full sm:w-1/3 p-2">
                                        <InputLabel shrink required>เบอร์โทร</InputLabel>
                                        <TextField
                                            value={form.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            error={!!errors.phone}
                                            helperText={errors.phone}
                                            inputProps={{ maxLength: 10 }} // ❌ กันเกิน 10 หลัก
                                            disabled={isTerminated}
                                        />
                                    </div>
                                    {/* Email */}
                                    <div className="w-full sm:w-2/3 p-2">
                                        <InputLabel shrink>Email</InputLabel>
                                        <TextField
                                            value={form.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            disabled={isTerminated}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom row of fields */}
                            <div className='w-full flex flex-row'>

                                <div className="w-full p-2">
                                    <InputLabel shrink>สังกัดหน่วยงาน</InputLabel>
                                    <Autocomplete
                                        options={departmentList.map(d => ({
                                            id: d.uid,           // ใช้ uid เก็บค่า
                                            label: d.dep_name,   // ใช้ชื่อหน่วยงานแสดงผล
                                        }))}
                                        disabled={isTerminated}
                                        value={
                                            departmentList
                                                .map(d => ({ id: d.uid, label: d.dep_name }))
                                                .find(opt => opt.id === form.dep_uid) || null
                                        }
                                        onChange={(_, newValue) => {
                                            setForm(prev => ({ ...prev, dep_uid: newValue?.id ?? "" }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="เลือกหน่วยงาน"
                                            />
                                        )}
                                        getOptionLabel={(o) => (typeof o === "string" ? o : o?.label ?? "")}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                    />
                                </div>
                                <div className="w-full p-2">
                                    <InputLabel shrink>เลขบัตรพนักงาน</InputLabel>
                                    <TextField
                                        value={form.emp_card_id}
                                        onChange={(e) => handleChange("emp_card_id", e.target.value)}
                                        disabled={isTerminated}
                                    />
                                </div>
                            </div>
                            <div className="w-full p-2">
                                <InputLabel shrink>หมายเหตุ</InputLabel>
                                <TextField
                                    multiline
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    disabled={isTerminated}
                                />
                            </div>
                        </div>
                    </Paper>

                    {/* Record Details Card */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>รายละเอียดการบันทึก</Typography>
                        <div className="flex flex-wrap -m-2">
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink>ผู้บันทึกข้อมูล</InputLabel>
                                <TextField disabled />
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink>วันที่บันทึกข้อมูล</InputLabel>
                                <DatePicker disabled />
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink>ผู้แก้ไขข้อมูล</InputLabel>
                                <TextField disabled />
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink>วันที่แก้ไขข้อมูล</InputLabel>
                                <DatePicker disabled />
                            </div>
                        </div>
                    </Paper>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-6/12 flex flex-col gap-6">
                    {/* Additional Info Card */}
                    <div className='py-2 px-4 bg-primary h-full text-white'>
                        <Typography variant="h6" gutterBottom>รายละเอียดเพิ่มเติม</Typography>
                        <div className="flex flex-wrap -m-2 mt-3 ">
                            {/* 🔹 ประเภทบุคคล */}
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink className="!text-white">ประเภทบุคคล</InputLabel>
                                <Select
                                    value={form.member_group_id}
                                    onChange={(e) => handleChange("member_group_id", Number(e.target.value))}
                                    disabled={isTerminated}
                                >
                                    <MenuItem value={0}><em>ทุกประเภท</em></MenuItem>
                                    {memberGroups.map((mg) => (
                                        <MenuItem key={mg.id} value={mg.id}>
                                            {mg.name_th}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink className='!text-white'>Card Code</InputLabel>
                                <TextField disabled value={form.card_code} />
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink className='!text-white'>Card Number (Hex)</InputLabel>
                                <TextField disabled value={form.card_number} />
                            </div>
                            <div className="w-full sm:w-1/2 flex">
                                <div className='w-1/2 p-2'>
                                    <InputLabel shrink required className='!text-white'>วันเริ่มต้น</InputLabel>
                                    <DatePicker
                                        value={form.start_date ? dayjs(form.start_date) : null}
                                        onChange={(date) =>
                                            handleChange("start_date", date ? dayjs(date).format("YYYY-MM-DD") : "")
                                        }
                                        disabled={isTerminated}
                                        slotProps={{
                                            textField: {
                                                error: !!errors.start_date,
                                                helperText: errors.start_date,
                                            },
                                        }}
                                    />
                                </div>
                                <div className='w-1/2 p-2'>
                                    <InputLabel shrink required className='!text-white'>วันสิ้นสุด</InputLabel>
                                    <DatePicker
                                        value={form.end_date ? dayjs(form.end_date) : null}
                                        onChange={(date) =>
                                            handleChange("end_date", date ? dayjs(date).format("YYYY-MM-DD") : "")
                                        }
                                        disabled={isTerminated}
                                        slotProps={{
                                            textField: {
                                                error: !!errors.end_date,
                                                helperText: errors.end_date,
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            {uid && <>
                                <div className="w-full flex gap-2 justify-end p-2 mt-auto">
                                    <Button variant="outlined" size="small" className='!border-gold !text-primary !bg-white' startIcon={<EditSquareIcon fontWeight="small" />} disabled={isTerminated}>
                                        เปลี่ยนบัตร
                                    </Button>
                                    <Button variant="outlined" size="small" className='!border-gold !text-primary !bg-white' startIcon={<CancelOutlinedIcon fontWeight="small" />} disabled={isTerminated}
                                        onClick={() => handleTerminateMember(uid)}
                                    >
                                        ยกเลิกบัตร
                                    </Button>
                                </div>
                            </>
                            }
                        </div>

                        <hr className='mt-2' />


                        {/* Car Details Card */}
                        <Box mt={3}>
                            <Box className=" flex flex-col gap-3 justify-start  mb-2">
                                <Typography variant="h6">รายละเอียดรถ</Typography>
                                <Button size="small" className='!bg-gold !text-primary w-[120px]' disabled={isTerminated} startIcon={<AddIcon />} onClick={handleOpenCarPopup}>เพิ่มรถ</Button>
                            </Box>
                            <Box sx={{ height: '100%', width: '100%' }}>
                                <DataTable
                                    getRowId={(row) => row.uid}
                                    columns={carColumns}
                                    rows={carRows}
                                    sx={{
                                        '&& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#2E514E',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        },
                                        '&& .MuiDataGrid-columnHeader': {
                                            backgroundColor: '#2E514E',
                                        },
                                    }} />
                            </Box>
                            {/* ✅ แสดงข้อความ error ถ้าไม่มีรถ */}
                            {errors.vehicle_uid_list && (
                                <Typography variant="body2" color="error" className="mt-2">
                                    {errors.vehicle_uid_list}
                                </Typography>
                            )}
                        </Box>
                    </div>
                </div>

            </div>

            {/* Bottom Action Buttons */}

            <div className="w-full flex justify-end gap-2 mt-6">
                <Button variant="outlined" className='!border-primary !bg-white !text-primary' startIcon={<CloseIcon />} onClick={handleBlackBtn}>ยกเลิก</Button>
                <Button variant="contained" startIcon={<SaveIcon />} className="!bg-primary hover:!bg-primary-dark" onClick={() => handleSave()} disabled={isTerminated}>บันทึก</Button>
            </div>

            <Popup
                title="เพิ่มข้อมูลรถ"
                show={isCarPopupOpen}
                onClose={handleCloseCarPopup}
            >
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
                                {/* เลขทะเบียน */}
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>เลขทะเบียน</InputLabel>
                                    <div className="flex flex-row gap-2">
                                        <TextField
                                            placeholder="หมวด"
                                            value={search.plate_prefix || ""}
                                            onChange={(e) =>
                                                setSearch((prev) => ({ ...prev, plate_prefix: e.target.value }))
                                            }
                                        />
                                        <TextField
                                            placeholder="เลข"
                                            value={search.plate_number || ""}
                                            onChange={(e) =>
                                                setSearch((prev) => ({ ...prev, plate_number: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>
                                {/* หมวดจังหวัด */}
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>หมวดจังหวัด</InputLabel>
                                    <Select
                                        value={search.region_code || ""}
                                        onChange={(e) => setSearch({ ...search, region_code: e.target.value })}
                                        disabled={isTerminated}
                                    >
                                        <MenuItem value=""><em>ทุกจังหวัด</em></MenuItem>
                                        {regions.map((r) => (
                                            <MenuItem key={r.region_code} value={r.region_code}>
                                                {r.name_th}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                {/* ยี่ห้อ */}
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>ยี่ห้อ</InputLabel>
                                    <Select
                                        value={search.vehicle_make || ""}
                                        onChange={(e) => setSearch({ ...search, vehicle_make: e.target.value })}
                                        disabled={isTerminated}
                                    >
                                        <MenuItem value=""><em>ทุกยี่ห้อ</em></MenuItem>
                                        {vehicleMakes.map((m) => (
                                            <MenuItem key={m.id} value={m.make_en}>
                                                {m.make_en}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                {/* สี */}
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>สี</InputLabel>
                                    <Select
                                        value={search.vehicle_color_id || ""}
                                        onChange={(e) => setSearch({ ...search, vehicle_color_id: Number(e.target.value) })}
                                        disabled={isTerminated}
                                    >
                                        <MenuItem value=""><em>ทุกสี</em></MenuItem>
                                        {vehicleColors.map((c) => (
                                            <MenuItem key={c.id} value={c.color_en}>
                                                {c.color_th}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>

                            </div>

                            <div className="w-full flex justify-end p-2">
                                <Button
                                    variant="contained"
                                    startIcon={<SearchIcon />}
                                    className="!bg-primary hover:!bg-primary-dark"
                                    onClick={() => {
                                        const resetPage = 0;
                                        setPaginationModel((prev) => ({ ...prev, page: resetPage }));
                                        loadData(resetPage + 1, paginationModel.pageSize, search); // ✅ ยิง API แค่ครั้งเดียว
                                    }}
                                >
                                    ค้นหา
                                </Button>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Box sx={{ height: 400, width: '100%', marginTop: 3 }}>
                    <DataTable
                        getRowId={(row) => row.uid}
                        columns={popupCarColumns}
                        rows={popupCarRows}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={(model) => {
                            setPaginationModel(model);
                            loadData(model.page + 1, model.pageSize, search); // ✅ ยิง API เมื่อเปลี่ยนหน้า
                        }}
                        rowCount={rowCount}
                    />
                </Box>
                <div className="w-full flex justify-end gap-2 mt-6">
                    <Button variant="outlined" className='!border-primary !bg-white !text-primary' startIcon={<CloseIcon />} onClick={handleCloseCarPopup}>ยกเลิก</Button>
                    <Button variant="contained" startIcon={<CheckCircleOutlinedIcon fontWeight="small" />} className="!bg-primary hover:!bg-primary-dark" onClick={handleConfirmCars} >เลือก</Button>
                </div>
            </Popup>
        </div>
    );
};

export default PersonInfoForm;



