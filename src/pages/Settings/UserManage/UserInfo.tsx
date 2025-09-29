// src/pages/Settings/UserManage/UserInfo.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Paper, Typography, Box, TextField, Select, MenuItem,
  Button, Avatar, FormControlLabel, InputLabel, Checkbox, Stack
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from '../../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import dialog from '../../../services/dialog.service';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserApi, type User, type CreateUserPayload, type UpdateUserPayload } from '../../../services/User.service';
import dayjs from 'dayjs';
import FileUploadApi from '../../../services/FileUpload.service';

// Permissions master
const PERM_MENUS = [
  { id: 'dashboard', menu: 'ข้อมูลการเข้า-ออกพื้นที่' },
  { id: 'car_search', menu: 'ค้นหารถ' },
  { id: 'person_search', menu: 'ค้นหาบุคคล' },
  { id: 'video_search', menu: 'ค้นหาvideo' },
  { id: 'car_manage', menu: 'บันทึกข้อมูลรถ' },
  { id: 'person_manage', menu: 'บันทึกข้อมูลบุคคล' },
  { id: 'system_manage', menu: 'ตั้งค่าระบบ' },
  { id: 'user_manage', menu: 'จัดการสิทธิ์การใช้งาน' },
  { id: 'department_manage', menu: 'จัดการข้อมูลหน่วยงาน' },
];

const UserInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const uid = (location.state as { uid?: string })?.uid ?? null;

  const [loading, setLoading] = useState(false);
  // เก็บค่า originalForm ตอน load
  const [originalForm, setOriginalForm] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserPayload | UpdateUserPayload>({
    title: 'mr',
    firstname: '',
    lastname: '',
    gender: 'male',
    idcard: '',
    dob: '',
    phone: '',
    email: '',
    organization: '',
    job_position: '',
    emp_card_id: '',
    notes: '',
    username: '',
    password: '',
    user_status: 'active',
    active: true,
    visible: true,
    permissions: {},
  });
  // เพิ่ม state errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    PERM_MENUS.reduce((acc, m) => ({ ...acc, [m.id]: false }), {})
  );
  // เพิ่ม state สำหรับไฟล์
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // โหลดข้อมูลถ้าเป็น edit
  useEffect(() => {
    if (!uid) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await UserApi.getByUid(uid);
        if (res.success && res.data && res.data.length > 0) {
          const user = res.data[0];
          setForm({ ...user, password: "" }); // ไม่โชว์ password
          setOriginalForm(user); // ✅ เก็บไว้เปรียบเทียบ
          if (user.permissions && typeof user.permissions === "object") {
            setPermissions(user.permissions as Record<string, boolean>);
          }
          setSelectedImage(user.image_url || null);
        }
      } catch (err) {
        console.error("Load user error:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchUser();
  }, [uid]);



  // อัปเดตค่า form
  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // toggle permission
  const handleTogglePerm = (id: string) => {
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // validate ไฟล์รูป
  const validateFile = (file: File) => {
    const isValidType = ['image/png', 'image/jpeg'].includes(file.type);
    const isValidSize = file.size <= 5 * 1024 * 1024;
    if (!isValidType) { dialog.warning('อนุญาตเฉพาะไฟล์ PNG หรือ JPEG'); return false; }
    if (!isValidSize) { dialog.warning('ขนาดไฟล์ต้องไม่เกิน 5MB'); return false; }
    return true;
  };


  // ฟังก์ชันตรวจสอบเลขบัตรประชาชน
  const isValidThaiIdCard = (id: string): boolean => {
    if (!/^\d{13}$/.test(id)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += Number(id.charAt(i)) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === Number(id.charAt(12));
  };

  const isValidPhone = (phone: string): boolean => /^0\d{9}$/.test(phone);
  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

    if (!form.username) newErrors.username = "กรุณากรอก Username";
    if (!form.password) newErrors.password = "กรุณากรอก Password"; // create mode

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleFileChange ปรับให้เก็บไฟล์จริงด้วย
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;
    setSelectedFile(file); // ✅ เก็บไฟล์ไว้ใช้ upload
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
  };

  // แก้ handleSave ให้เรียก validate ก่อน save
  const getChangedFields = (original: any, current: any) => {
    const changed: any = { uid: current.uid };
    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key]) {
        changed[key] = current[key];
      }
    });
    return changed;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    dialog.loading();

    try {
      let imageUrl = form.image_url;

      if (selectedFile) {
        const uploadRes = await FileUploadApi.upload(selectedFile);
        if (uploadRes.success) {
          imageUrl = uploadRes.data[0].url;
        }
      }

      const currentPayload = { ...form, image_url: imageUrl, permissions };
      let res;

      if (uid && originalForm) {
        const changed = getChangedFields(originalForm, currentPayload);
        res = await UserApi.update(changed);
      } else {
        res = await UserApi.create(currentPayload);
      }

      if (res.success) {
        dialog.success(uid ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มผู้ใช้สำเร็จ");
        navigate("/settings/usermanage/userlist");
      } else {
        dialog.error(res.message || "ไม่สามารถบันทึกได้");
      }
    } catch (err) {
      dialog.error("เกิดข้อผิดพลาดระหว่างบันทึก");
    } finally {
      dialog.close();
    }
  };

  // columns for permission table
  const permColumns: GridColDef[] = [
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
    { field: 'menu', headerName: 'ชื่อเมนู', flex: 1, headerAlign: 'center' },
    {
      field: 'allow',
      headerName: 'สิทธิ์การใช้งาน',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(permissions[params.row.id])}
          onChange={() => handleTogglePerm(params.row.id)}
        />
      ),
    },
  ];

  return (
    <div className='flex flex-col'>
      <div className="flex flex-wrap lg:flex-nowrap gap-6">

        {/* Left Column */}
        <div className="w-full lg:w-7/12 flex flex-col gap-6">
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
              ข้อมูลบุคคล
            </Typography>
            <div className="flex flex-wrap -m-2">
              {/* Avatar */}
              <div className="w-full md:w-1/3 p-2">
                <div className='relative'>
                  <input ref={fileInputRef} type='file' accept='image/png,image/jpeg' className='hidden' onChange={handleFileChange} />
                  <Box sx={{ position: 'relative', width: 220, height: 220 }} className='rounded-full border-[8px] border-gold'>
                    {selectedImage ? (
                      <Avatar variant='circular' src={selectedImage} onClick={() => fileInputRef.current?.click()} sx={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                    ) : (
                      <Box role='button' onClick={() => fileInputRef.current?.click()} className='flex flex-col items-center justify-center cursor-pointer bg-white rounded-full hover:bg-gray-50' sx={{ width: '100%', height: '100%' }}>
                        <CloudUploadOutlinedIcon sx={{ color: 'text.disabled', fontSize: 42, mb: 1 }} />
                        <Typography variant='body2' color='text.secondary'>ขนาดภาพ 50-100 Kb</Typography>
                      </Box>
                    )}
                  </Box>
                  <div className="mt-2 text-center">
                    <FormControlLabel
                      control={<Checkbox checked={!form.active} onChange={(e) => handleChange('active', !e.target.checked)} />}
                      label="Inactive"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="w-full md:w-2/3 p-2">
                <div className="flex flex-wrap -m-2">
                  <div className="w-full sm:w-[30%] p-2">
                    <InputLabel shrink required>คำนำหน้า</InputLabel>
                    <Select value={form.title} onChange={(e) => handleChange('title', e.target.value)}>
                      <MenuItem value="mr">นาย</MenuItem>
                      <MenuItem value="mrs">นาง</MenuItem>
                      <MenuItem value="miss">นางสาว</MenuItem>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink required>ชื่อ</InputLabel>
                    <TextField
                      value={form.firstname}
                      onChange={(e) => handleChange("firstname", e.target.value)}
                      error={!!errors.firstname}
                      helperText={errors.firstname}
                    />
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink required>นามสกุล</InputLabel>
                    <TextField value={form.lastname} onChange={(e) => handleChange('lastname', e.target.value)} />
                  </div>

                  <div className="w-full sm:w-[30%] p-2">
                    <InputLabel shrink required>เพศ</InputLabel>
                    <Select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                      <MenuItem value="male">ชาย</MenuItem>
                      <MenuItem value="female">หญิง</MenuItem>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink required>เลขที่บัตรประชาชน</InputLabel>
                    <TextField
                      value={form.idcard}
                      onChange={(e) => handleChange("idcard", e.target.value)}
                      error={!!errors.idcard}
                      helperText={errors.idcard}
                    />
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink>วันเกิด</InputLabel>
                    <DatePicker
                      value={form.dob ? dayjs(form.dob) : null}
                      onChange={(date) =>
                        handleChange("dob", date ? dayjs(date).format("YYYY-MM-DD") : "")
                      }

                    />
                  </div>

                  <div className="w-full sm:w-1/3 p-2">
                    <InputLabel shrink required>เบอร์โทร</InputLabel>
                    <TextField
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      inputProps={{ maxLength: 10 }}
                    />
                  </div>
                  <div className="w-full sm:w-2/3 p-2">
                    <InputLabel shrink>Email</InputLabel>
                    <TextField
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom row of fields */}
              <div className='w-full flex flex-row'>
                <div className="w-full p-2">
                  <InputLabel shrink>สังกัดหน่วยงาน</InputLabel>
                  <TextField value={form.organization} onChange={(e) => handleChange('organization', e.target.value)} />
                </div>
                <div className="w-full p-2">
                  <InputLabel shrink>เลขบัตรพนักงาน</InputLabel>
                  <TextField value={form.emp_card_id} onChange={(e) => handleChange('emp_card_id', e.target.value)} />
                </div>
              </div>
              <div className="w-full p-2">
                <InputLabel shrink>หมายเหตุ</InputLabel>
                <TextField multiline rows={2} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap -m-2 mt-14 border-t-[1px] border-gray-600 pt-4">
              <div className="w-full sm:w-1/2 p-2">
                <InputLabel shrink required>Username</InputLabel>
                <TextField
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  error={!!errors.username}
                  helperText={errors.username}
                />
              </div>
              <div className="w-full sm:w-1/2 p-2">
                <InputLabel shrink required>Password</InputLabel>
                <TextField
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </div>
            </div>
          </Paper>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          <div className='py-2 px-4 bg-primary text-white'>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', bgcolor: '#36746F', px: 2, py: 1, borderRadius: 1, mb: 2 }}>
              สิทธิ์การใช้งาน
            </Typography>
            <Box>
              <DataTable rows={PERM_MENUS} columns={permColumns}
                sx={{
                  '&& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#2E514E',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }} />
            </Box>
          </div>
        </div>

      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full flex justify-end gap-2 mt-6">
        <Button variant="outlined" className='!border-primary !bg-white !text-primary' startIcon={<CloseOutlinedIcon />} onClick={() => navigate(-1)}>ยกเลิก</Button>
        <Button variant="contained" startIcon={<SaveOutlinedIcon />} className="!bg-primary hover:!bg-primary-dark" onClick={handleSave} disabled={loading}>
          บันทึก
        </Button>
      </div>
    </div>
  );
};

export default UserInfoPage;
