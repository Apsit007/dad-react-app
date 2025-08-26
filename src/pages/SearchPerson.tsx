// src/pages/SearchPerson.tsx

import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Avatar, Chip, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DataTable from '../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';

// --- Data for Table ---
const columns: GridColDef[] = [
    { field: 'id', headerName: 'ลำดับ', width: 70, headerAlign: 'center', align: 'center' },
    {
        field: 'image', headerName: 'ภาพ', width: 150, headerAlign: 'center', align: 'center', sortable: false,
        renderCell: (params) => (
            <Box sx={{ position: 'relative' }}>
                <Avatar variant="rounded" src={params.value} sx={{ width: 70, height: 50 }} />
                <Chip label="Member" size="small" color="warning" sx={{ position: 'absolute', bottom: 4, right: 4, height: '16px', fontSize: '0.65rem' }} />
            </Box>
        )
    },
    { field: 'name', headerName: 'ชื่อ-นามสกุล', flex: 1, minWidth: 200, headerAlign: 'center' },
    { field: 'similarity', headerName: '% ความคล้ายคลึง', width: 150, headerAlign: 'center', align: 'center' },
    { field: 'department', headerName: 'หน่วยงาน', flex: 1, minWidth: 250, headerAlign: 'center' },
    { field: 'plate', headerName: 'ทะเบียนรถ', flex: 1, minWidth: 250, headerAlign: 'center' },
    { field: 'bran', headerName: 'ยี่ห้อ', flex: 1, minWidth: 250, headerAlign: 'center' },
    { field: 'color', headerName: 'สี', flex: 1, minWidth: 250, headerAlign: 'center' },
    { field: 'in_time', headerName: 'วันเวลาเข้า', flex: 1, minWidth: 250, headerAlign: 'center' },
    { field: 'out_tiem', headerName: 'เวลาออก', flex: 1, minWidth: 250, headerAlign: 'center' },
];
const rows = [
    { id: 1, image: 'https://i.imgur.com/8A2u5vA.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 98, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 2, image: 'https://i.imgur.com/hI2CMpE.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 95, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 3, image: 'https://i.imgur.com/uP42D4I.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 97, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 4, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 5, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 6, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 7, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 8, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 9, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 10, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 11, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 12, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 13, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 14, image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
];

const SearchPerson = () => {

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                ค้นหาบุคคล
            </Typography>

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>Search</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'white' }}>
                    {/* 👇 Grid is replaced with div and Tailwind classes 👇 */}
                    <div className="flex flex-wrap">
                        <div className="w-full md:w-1/6 p-2 text-center">
                            <Avatar variant="rounded" sx={{ width: 120, height: 150, m: 'auto' }} />
                        </div>
                        <div className="w-full md:w-5/6 p-2">
                            <div className="flex flex-wrap -m-2">
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption' >ชื่อ</Typography>
                                    <TextField placeholder='ชื่อ' />
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>นามสกุล</Typography>
                                    <TextField placeholder='นามสกุล' />
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>ประเภทบุคคล</Typography>
                                    <Select defaultValue="">
                                        <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                        <MenuItem value="member">Member</MenuItem>
                                        <MenuItem value="visitor">Visitor</MenuItem>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>รูปแบบการค้นหา</Typography>
                                    <Select defaultValue="last-seen">
                                        <MenuItem value="last-seen">ค้นหาจากวันที่ล่าสุด</MenuItem>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>วันที่เริ่มต้น</Typography>
                                    <DateTimePicker sx={{ width: '100%' }} />
                                </div>
                                <div className="w-full sm:w-1/3 p-2">
                                    <Typography variant='caption'>วันที่สิ้นสุด</Typography>
                                    <DateTimePicker sx={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex justify-end p-2">
                            <Button variant="contained" startIcon={<SearchIcon />} className='!bg-primary hover:!bg-primary-dark' >
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
            <div className="flex-1 flex flex-col ">

                <DataTable
                    rows={rows}
                    columns={columns}

                />
            </div>
        </Box>
    );
};

export default SearchPerson;