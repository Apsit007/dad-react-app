// src/pages/InOutPage.tsx
import { type GridColDef, type GridRowClassNameParams } from '@mui/x-data-grid';
import { Chip, Avatar, Box, Typography } from '@mui/material';
import DataTable from '../components/DataTable';
import InOutDashboard from '../components/InOutDashboard';

// 1. กำหนดโครงสร้างคอลัมน์ (Columns)
const columns: GridColDef[] = [
    { field: 'time', headerName: 'เวลาเข้า', flex: 2, headerAlign: 'center', },
    {
        field: 'eventType',
        headerName: 'ประเภท',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <Typography variant="body2">{params.value}</Typography>
        ),
    },
    {
        field: 'images',
        headerName: 'ภาพ',
        flex: 2,
        sortable: false,
        headerAlign: 'center',
        renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar variant="rounded" src={params.value.carUrl} sx={{ width: 70, height: 50 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {params.value.tags.map((tag: { label: string, color: string }, index: number) => (
                        <Chip key={index} label={tag.label} size="small" sx={{
                            bgcolor: tag.color === 'blue' ? '#2196f3' : tag.color === 'orange' ? '#ff9800' : '#f44336',
                            color: 'white',
                            height: '20px',
                            fontSize: '0.7rem'
                        }} />
                    ))}
                </Box>
            </Box>
        ),
    },
    {
        field: 'licensePlate',
        headerName: 'เลขทะเบียน',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <Box>
                <Typography variant="body2" sx={{ color: params.row.isBlacklist ? 'red' : 'inherit', fontWeight: 'bold' }}>
                    {params.value.number}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {params.value.province}
                </Typography>
            </Box>
        )
    },
    { field: 'brand', headerName: 'ยี่ห้อ', flex: 2, headerAlign: 'center', },
    { field: 'color', headerName: 'สี', flex: 2, headerAlign: 'center', },
    {
        field: 'name',
        headerName: 'ชื่อ-นามสกุล',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <Typography variant="body2" sx={{ color: params.row.isBlacklist ? 'red' : 'inherit' }}>
                {params.value}
            </Typography>
        )
    },
    { field: 'department', headerName: 'หน่วยงาน', flex: 2, headerAlign: 'center', },
];

// 2. สร้างข้อมูลตัวอย่าง (Rows)
const rows = [
    { id: 1, time: '10/10/2569 10:30:10', eventType: 'ขาเข้า', images: { carUrl: 'https://i.imgur.com/uP42D4I.png', tags: [{ label: 'Blacklist', color: 'red' }, { label: 'Visitor', color: 'blue' }] }, licensePlate: { number: 'กง 1442', province: 'กรุงเทพมหานคร' }, brand: 'Nissan', color: 'เทา', name: 'นายพลากร เพชรพร้อม', department: '-', isBlacklist: true },
    { id: 2, time: '10/10/2569 10:29:15', eventType: 'ขาออก', images: { carUrl: 'https://i.imgur.com/8A2u5vA.png', tags: [{ label: 'Member', color: 'orange' }, { label: 'Visitor', color: 'blue' }] }, licensePlate: { number: '3กน 1776', province: 'กรุงเทพมหานคร' }, brand: 'Honda', color: 'ขาว', name: 'นายอนงค์ อารมณ์ดี', department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ', isBlacklist: false },
    { id: 3, time: '10/10/2569 10:25:10', eventType: 'ขาเข้า', images: { carUrl: 'https://i.imgur.com/hI2CMpE.png', tags: [{ label: 'Member', color: 'orange' }, { label: 'Member', color: 'orange' }] }, licensePlate: { number: '66 4578', province: 'กรุงเทพมหานคร' }, brand: 'Toyota', color: 'ส้ม', name: 'นางสาวสายชล สายแก้ว', department: '-', isBlacklist: false },
    { id: 4, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: { carUrl: 'https://i.imgur.com/1o2aY2V.png', tags: [{ label: 'Blacklist', color: 'red' }, { label: 'Blacklist', color: 'red' }] }, licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    // ... เพิ่มข้อมูลแถวอื่นๆ ตามต้องการ
];

// ฟังก์ชันสำหรับกำหนด class ให้กับแถว
const getRowClassName = (params: GridRowClassNameParams) => {
    // ถ้า isBlacklist เป็น true ให้ใช้ class 'highlight-row'
    return params.row.isBlacklist ? 'highlight-row' : '';
};

const InOutPage = () => {
    return (
        <div className="flex gap-8 h-full">
            <InOutDashboard />
            <div className="flex-1 flex flex-col">
                <DataTable
                    rows={rows}
                    columns={columns}
                />
            </div>
        </div>
    );
};

export default InOutPage;