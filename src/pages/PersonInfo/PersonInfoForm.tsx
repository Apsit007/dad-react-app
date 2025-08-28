// src/pages/PersonInfo/PersonInfoForm.tsx
import { Paper, Typography, Box, TextField, Select, MenuItem, Button, Avatar, FormControlLabel, Switch, InputLabel, Checkbox, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from '../../components/DataTable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import { type GridColDef } from '@mui/x-data-grid';
import EditSquareIcon from "@mui/icons-material/EditSquare"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import { useState } from 'react';
import Popup from '../../components/Popup';


// --- Columns and Data for the Popup Car Table ---
const popupCarColumns: GridColDef[] = [
    {
        field: 'select',
        headerName: 'เลือก',
        width: 70,
        align: 'center', headerAlign: 'center',
        renderCell: (params) => <Checkbox />,
    },
    { field: 'plate', headerName: 'ทะเบียนรถ', flex: 1 },
    { field: 'province', headerName: 'หมวดจังหวัด', flex: 1 },
    { field: 'brand', headerName: 'ยี่ห้อ', flex: 1 },
    { field: 'color', headerName: 'สี', flex: 1 },
];
const popupCarRows = [
    { id: 1, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', color: 'น้ำเงิน' },
    { id: 2, plate: 'ซย 4335', province: 'กรุงเทพมหานคร', brand: 'Isuzu', color: 'ดำ' },
    { id: 3, plate: '1กง 5577', province: 'พระนครศรีอยุธยา', brand: 'Volvo', color: 'ขาว' },
    // ... more data
];

// --- Mock Data and Columns for the Car Table ---
const carColumns: GridColDef[] = [
    { field: 'id', headerName: 'ลำดับ', width: 70, align: 'center', headerAlign: 'center' },
    { field: 'plate', headerName: 'ทะเบียน', flex: 1, headerAlign: 'center' },
    { field: 'province', headerName: 'หมวดจังหวัด', flex: 1, headerAlign: 'center' },
    { field: 'brand', headerName: 'ยี่ห้อ', flex: 1, headerAlign: 'center' },
    { field: 'color', headerName: 'สี', flex: 1, headerAlign: 'center' },
];
const carRows = []; // Start with no cars

const PersonInfoForm = () => {
    const [isCarPopupOpen, setIsCarPopupOpen] = useState(false);

    const handleOpenCarPopup = () => {
        setIsCarPopupOpen(true);
    };

    const handleCloseCarPopup = () => {
        setIsCarPopupOpen(false);
    };
    return (
        // Main container using Tailwind flexbox for columns
        <div className='flex flex-col'>
            <div className="flex flex-wrap lg:flex-nowrap gap-6">

                {/* Left Column */}
                <div className="w-full lg:w-7/12 flex flex-col gap-6">
                    {/* Person Info Card */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>ข้อมูลบุคคล</Typography>
                        <div className="flex flex-wrap -m-2">
                            {/* Avatar */}
                            <div className="w-full md:w-1/3 p-2">
                                <div className='relative'>
                                    <Avatar sx={{ width: 170, height: 170, m: 'auto' }} className='border-[5px] border-gold-light' />
                                    <Typography variant="caption" display="block" align="center" className='absolute bottom-7 left-[75px]' mt={1}>ขนาดภาพ 50-100 kb</Typography>
                                </div>
                                <div className="mt-2 text-center">
                                    <FormControlLabel control={<Checkbox />} label="Inactive" />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="w-full md:w-2/3 p-2">
                                <div className="flex flex-wrap -m-2">
                                    <div className="w-full sm:w-[30%] p-2">
                                        <InputLabel shrink required>คำนำหน้า</InputLabel>
                                        <Select defaultValue="mr">
                                            <MenuItem value="mr">นาย</MenuItem>
                                            <MenuItem value="mrs">นาง</MenuItem>
                                            <MenuItem value="miss">นางสาว</MenuItem>
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink required>ชื่อ</InputLabel>
                                        <TextField />
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink required>นามสกุล</InputLabel>
                                        <TextField />
                                    </div>

                                    <div className="w-full sm:w-[30%] p-2">
                                        <InputLabel shrink required>เพศ</InputLabel>
                                        <Select defaultValue="male">
                                            <MenuItem value="male">เลือกเพศ</MenuItem>
                                            <MenuItem value="female">หญิง</MenuItem>
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink required>เลขที่บัตรประชาชน</InputLabel>
                                        <TextField />
                                    </div>
                                    <div className="w-full sm:w-[35%] p-2">
                                        <InputLabel shrink>วันเกิด</InputLabel>
                                        <DatePicker />
                                    </div>

                                    <div className="w-full sm:w-1/3 p-2">
                                        <InputLabel shrink required>เบอร์โทร</InputLabel>
                                        <TextField />
                                    </div>
                                    <div className="w-full sm:w-2/3 p-2">
                                        <InputLabel shrink>Email</InputLabel>
                                        <TextField />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom row of fields */}
                            <div className='w-full flex flex-row'>

                                <div className="w-full p-2">
                                    <InputLabel shrink>สังกัดหน่วยงาน</InputLabel>
                                    <TextField />
                                </div>
                                <div className="w-full p-2">
                                    <InputLabel shrink>เลขบัตรพนักงาน</InputLabel>
                                    <TextField />
                                </div>
                            </div>
                            <div className="w-full p-2">
                                <InputLabel shrink>หมายเหตุ</InputLabel>
                                <TextField multiline rows={2} />
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
                <div className="w-full lg:w-5/12 flex flex-col gap-6">
                    {/* Additional Info Card */}
                    <div className='py-2 px-4 bg-primary text-white'>
                        <Typography variant="h6" gutterBottom>รายละเอียดเพิ่มเติม</Typography>
                        <div className="flex flex-wrap -m-2 mt-3 ">
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink className='!text-white'>ประเภทบุคคล</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value=""><em>ประเภทบุคคล</em></MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink className='!text-white'>Card Code</InputLabel>
                                <TextField />
                            </div>
                            <div className="w-full sm:w-1/2 p-2">
                                <InputLabel shrink className='!text-white'>Card Number (Hex)</InputLabel>
                                <TextField />
                            </div>
                            <div className="w-full flex gap-2 justify-end p-2 mt-auto">
                                <Button variant="outlined" size="small" className='!border-gold !text-primary !bg-white' startIcon={<EditSquareIcon fontWeight="small" />}>
                                    แก้ไขเลขบัตร
                                </Button>
                                <Button variant="outlined" size="small" className='!border-gold !text-primary !bg-white' startIcon={<CancelOutlinedIcon fontWeight="small" />}>
                                    ยกเลิกบัตร
                                </Button>
                            </div>
                        </div>

                        <hr className='mt-2' />


                        {/* Car Details Card */}
                        <Box mt={3}>
                            <Box className=" flex flex-col gap-3 justify-start  mb-2">
                                <Typography variant="h6">รายละเอียดรถ</Typography>
                                <Button size="small" className='!bg-gold !text-primary w-[120px]' startIcon={<AddIcon />} onClick={handleOpenCarPopup}>เพิ่มรถ</Button>
                            </Box>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <DataTable
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
                        </Box>
                    </div>
                </div>

            </div>
            {/* Bottom Action Buttons */}
            <div className="w-full flex justify-end gap-2 mt-6">
                <Button variant="outlined" className='!border-primary !bg-white !text-primary' startIcon={<CloseIcon />}>ยกเลิก</Button>
                <Button variant="contained" startIcon={<SaveIcon />} className="!bg-primary hover:!bg-primary-dark">บันทึก</Button>
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
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>เลขทะเบียน</InputLabel>
                                    <div className='flex flex-row gap-2'>
                                        <div className='md:!w-2/5'>
                                            <TextField />
                                        </div>
                                        <div className='md:!w-3/5'>
                                            <TextField />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>หมวดจังหวัด</InputLabel>
                                    <Select defaultValue="bkk">
                                        <MenuItem value="bkk">กรุงเทพมหานคร</MenuItem>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>ยี่ห้อ</InputLabel>
                                    <Select defaultValue="">
                                        <MenuItem value=""><em>ทุกยี่ห้อ</em></MenuItem>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>สี</InputLabel>
                                    <Select defaultValue="">
                                        <MenuItem value=""><em>ทุกสี</em></MenuItem>
                                    </Select>
                                </div>

                            </div>

                            <div className="w-full flex justify-end p-2">
                                <Button variant="contained" startIcon={<SearchIcon />} className='!bg-primary hover:!bg-primary-dark'>
                                    ค้นหา
                                </Button>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Box sx={{ height: 400, width: '100%', marginTop: 3 }}>
                    <DataTable columns={popupCarColumns} rows={popupCarRows} />
                </Box>
                <div className="w-full flex justify-end gap-2 mt-6">
                    <Button variant="outlined" className='!border-primary !bg-white !text-primary' startIcon={<CloseIcon />}>ยกเลิก</Button>
                    <Button variant="contained" startIcon={<CheckCircleOutlinedIcon fontWeight="small" />} className="!bg-primary hover:!bg-primary-dark">เลือก</Button>
                </div>
            </Popup>
        </div>
    );
};

export default PersonInfoForm;