// src/pages/CarInfo/CarInfoList.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Chip, Stack, InputLabel, IconButton, Dialog, DialogContent, DialogTitle, Checkbox, FormControlLabel } from '@mui/material';
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
import { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// --- Table Columns Definition ---
const columns: GridColDef[] = [
    { field: 'id', headerName: 'ลำดับ', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'plate', headerName: 'ทะเบียนรถ', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    { field: 'province', headerName: 'หมวดจังหวัด', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    { field: 'brand', headerName: 'ยี่ห้อ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'model', headerName: 'รุ่นรถ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'color', headerName: 'สี', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'createDate', headerName: 'วันที่สร้าง', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    {
        field: 'carGroup',
        headerName: 'กลุ่มรถ',
        flex: 1,
        minWidth: 150,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
            const typeMap = {
                Visitor: { label: 'Visitor', color: 'info' as const },
                Member: { label: 'Member', color: 'warning' as const },
                Blacklist: { label: 'Blacklist', color: 'error' as const },
                VIP: { label: 'VIP', color: 'success' as const }
            };
            const type = typeMap[params.value as keyof typeof typeMap] || { label: params.value, color: 'default' as const };
            return <Chip label={type.label} size="medium" className='w-[100px]' color={type.color} />;
        }
    },
    {
        field: 'actions',
        headerName: '',
        width: 100,
        sortable: false,
        align: 'center',
        renderCell: () => (
            <Stack direction="row">
                <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
        )
    }
];

// --- Mock Data ---
const rows = [
    { id: 1, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Visitor' },
    { id: 2, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
    { id: 3, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Visitor' },
    { id: 4, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
    { id: 5, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
    { id: 6, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'VIP' },
    { id: 7, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Member' },
    { id: 8, plate: 'กง 6677', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', color: 'น้ำเงิน', createDate: '10/10/2568', carGroup: 'Blacklist' },
];

const CarInfoList = () => {
    const [isCarFormOpen, setIsCarFormOpen] = useState(false);
    const handleOpenCarForm = () => setIsCarFormOpen(true);
    const handleCloseCarForm = () => setIsCarFormOpen(false);



    return (
        <Box>
            {/* The page title is now in the Navbar, so we can remove it from here */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>Search</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'white' }}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap -m-2">
                            <div className="w-full flex sm:w-1/2 md:w-1/5">


                                <div className="w-full sm:w-1/3 md:w-1/3 p-2">
                                    <InputLabel shrink>ทะเบียน</InputLabel>
                                    <TextField placeholder="กง" />
                                </div>
                                <div className="w-full sm:w-2/3 md:w-2/3 p-2">
                                    <InputLabel shrink>&nbsp;</InputLabel>
                                    <TextField placeholder="เลขทะเบียน" />
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>หมวดจังหวัด</InputLabel>
                                <Select defaultValue="bkk">
                                    <MenuItem value="bkk">กรุงเทพมหานคร</MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>ยี่ห้อ</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value=""><em>ทุกยี่ห้อ</em></MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>สี</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value=""><em>ทุกสี</em></MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>กลุ่มรถ</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (เริ่มต้น)</InputLabel>
                                <DatePicker />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (สิ้นสุด)</InputLabel>
                                <DatePicker />
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

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <Button variant="contained" size="small" startIcon={<AddIcon />} className='!bg-gold hover:!bg-gold-dark' onClick={handleOpenCarForm}>ทะเบียนรถ</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/txt-file.png' />}>TXT</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/xls-file.png' />}>XLS</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/csv-file.png' />}>CSV</Button>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>ผลการค้นหา : 10 รายการ</Typography>
            </Stack>

            <DataTable
                rows={rows}
                columns={columns}
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
                                        <TextField placeholder="หมวดอักษร" />
                                        <TextField placeholder="เลขทะเบียน" />
                                    </div>
                                </div>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>หมวดจังหวัด *</InputLabel>
                                    <Select defaultValue=""><MenuItem value=""><em>เลือกหมวดจังหวัด *</em></MenuItem></Select>
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>ยี่ห้อ</InputLabel>
                                    <Select defaultValue=""><MenuItem value=""><em>เลือกยี่ห้อ</em></MenuItem></Select>
                                </div>
                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>รุ่น</InputLabel>
                                    <Select defaultValue=""><MenuItem value=""><em>เลือกรุ่น</em></MenuItem></Select>
                                </div>
                            </div>
                            <div className='flex gap-2'>

                                <div className='w-1/2'>
                                    <InputLabel required shrink className='!text-white'>สี</InputLabel>
                                    <Select defaultValue=""><MenuItem value=""><em>เลือกสี</em></MenuItem></Select>
                                </div>
                                <div className='w-1/2 pt-5'>
                                    <FormControlLabel
                                        control={<Checkbox sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
                                        label={<Typography sx={{ color: 'white' }}>Inactive</Typography>}
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel shrink className='!text-white'>หมายเหตุ</InputLabel>
                                <TextField multiline rows={4} />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="w-full lg:w-[45%] flex flex-col gap-4  bg-white p-4">
                            <div className='card border-[1px]'>
                                <InputLabel required shrink>กลุ่มรถ</InputLabel>
                                <Select defaultValue=""><MenuItem value=""><em>เลือกกลุ่มรถ</em></MenuItem></Select>
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

                                <Button variant="outlined" className='!border-primary !text-primary' onClick={handleCloseCarForm} startIcon={<CloseIcon />}>ยกเลิก</Button>
                                <Button variant="contained" onClick={handleCloseCarForm} startIcon={<SaveIcon />} className="!bg-primary hover:!bg-primary-dark">บันทึก</Button>

                            </div>
                        </div>
                    </div>
                </DialogContent>

            </Dialog >
        </Box >
    );
};

export default CarInfoList;