// src/pages/SearchCar.tsx

import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Stack, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DataTable from '../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import ImageTag from '../../components/ImageTag';

// --- 1. อัปเดต Columns ของตาราง ---
const columns: GridColDef[] = [
    { field: 'id', headerName: 'ลำดับ', width: 70, headerAlign: 'center', align: 'center' },
    {
        field: 'image', headerName: 'ภาพ', width: 200, headerAlign: 'center', align: 'center', sortable: false,
        renderCell: (params) => (
            <div className='flex w-full gap-2 h-full'>
                <ImageTag tag={params.row.car_tag} img={params.value} />
                <ImageTag tag={params.row.person_tag} img={params.value} />
            </div>
        )
    },
    { field: 'plate', headerName: 'ทะเบียน', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    { field: 'brand', headerName: 'ยี่ห้อ', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'color', headerName: 'สี', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'ชื่อ-นามสกุล', flex: 1.5, minWidth: 200, headerAlign: 'center' },
    { field: 'department', headerName: 'หน่วยงาน', flex: 1.5, minWidth: 250, headerAlign: 'center' },
    { field: 'in_time', headerName: 'วันเวลาเข้า', flex: 1, minWidth: 180, headerAlign: 'center', align: 'center' },
    { field: 'out_time', headerName: 'เวลาออก', flex: 1, minWidth: 180, headerAlign: 'center', align: 'center' },
];

// --- 2. ทำให้ข้อมูลเริ่มต้นเป็นค่าว่างเพื่อให้ตารางแสดง "ไม่มีข้อมูล" ---
//todo mockupdata match coolumns 10 rows
const rows = [
    { id: 1, image: 'https://i.imgur.com/8A2u5vA.png', car_tag: 'member', person_tag: 'member', plate: 'ABC-1234', brand: 'Toyota', color: 'White', name: 'John Doe', department: 'Engineering', in_time: '2025-08-25 08:15', out_time: '2025-08-25 17:30' },
    { id: 2, image: 'https://i.imgur.com/hI2CMpE.png', car_tag: 'member', person_tag: 'member', plate: 'XYZ-5678', brand: 'Honda', color: 'Black', name: 'Jane Smith', department: 'HR', in_time: '2025-08-25 08:25', out_time: '2025-08-25 17:10' },
    { id: 3, image: 'https://i.imgur.com/uP42D4I.png', car_tag: 'member', person_tag: 'member', plate: 'JKL-9101', brand: 'Ford', color: 'Blue', name: 'Michael Lee', department: 'Finance', in_time: '2025-08-25 09:00', out_time: '2025-08-25 18:00' },
    { id: 4, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', plate: 'MNO-1121', brand: 'Nissan', color: 'Red', name: 'Emily Clark', department: 'Marketing', in_time: '2025-08-25 07:55', out_time: '2025-08-25 16:45' },
    { id: 5, image: 'https://i.imgur.com/8A2u5vA.png', car_tag: 'member', person_tag: 'member', plate: 'PQR-3141', brand: 'Mazda', color: 'Gray', name: 'David Kim', department: 'Operations', in_time: '2025-08-25 08:05', out_time: '2025-08-25 17:20' },
    { id: 6, image: 'https://i.imgur.com/hI2CMpE.png', car_tag: 'member', person_tag: 'member', plate: 'STU-5161', brand: 'BMW', color: 'Silver', name: 'Sophia Nguyen', department: 'Sales', in_time: '2025-08-25 09:10', out_time: '2025-08-25 18:05' },
    { id: 7, image: 'https://i.imgur.com/uP42D4I.png', car_tag: 'member', person_tag: 'member', plate: 'VWX-7181', brand: 'Mercedes', color: 'White', name: 'Liam Patel', department: 'Support', in_time: '2025-08-25 08:40', out_time: '2025-08-25 17:35' },
    { id: 8, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', plate: 'YZA-9202', brand: 'Hyundai', color: 'Green', name: 'Olivia Brown', department: 'Legal', in_time: '2025-08-25 08:00', out_time: '2025-08-25 17:00' },
    { id: 9, image: 'https://i.imgur.com/8A2u5vA.png', car_tag: 'member', person_tag: 'member', plate: 'BCD-2233', brand: 'Kia', color: 'Yellow', name: 'Noah Wilson', department: 'IT', in_time: '2025-08-25 09:20', out_time: '2025-08-25 18:15' },
    { id: 10, image: 'https://i.imgur.com/hI2CMpE.png', car_tag: 'member', person_tag: 'member', plate: 'EFG-4455', brand: 'Audi', color: 'Black', name: 'Ava Martinez', department: 'Admin', in_time: '2025-08-25 08:10', out_time: '2025-08-25 17:25' },
];
const SearchCar = () => {
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
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
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
                                <InputLabel shrink>ประเภทรถ</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                </Select>
                            </div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-wrap -m-2">
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>รูปแบบการค้นหา</InputLabel>
                                <Select defaultValue="all">
                                    <MenuItem value="all">ทั้งหมด</MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่เริ่มต้น</InputLabel>
                                <DateTimePicker />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/5 p-2">
                                <InputLabel shrink>วันที่สิ้นสุด</InputLabel>
                                <DateTimePicker />
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
        </Box>
    );
};

export default SearchCar;