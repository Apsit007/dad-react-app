// src/pages/InOutPage.tsx
import { type GridColDef, type GridRowClassNameParams } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import InOutDashboard from '../components/InOutDashboard';
import ImageTag from '../components/ImageTag';
import BlackListAlert from '../components/BlackListAlert';

// 1. กำหนดโครงสร้างคอลัมน์ (Columns)
const columns: GridColDef[] = [
    {
        field: 'time',
        headerName: 'เวลาเข้า',
        flex: 1,
        headerAlign: 'center',
        renderCell: (params) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',     // กลางแนวตั้ง
                    justifyContent: 'center', // กลางแนวนอน
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                    {params.value}
                </Typography>
            </div>
        ),
    },
    {
        field: 'eventType',
        headerName: 'ประเภท',
        flex: 1,
        headerAlign: 'center',
        align: 'center',
        // renderCell: (params) => (
        //     <Typography variant="body2">{params.value}</Typography>
        // ),
    },
    {
        field: 'images',
        headerName: 'ภาพ',
        flex: 2,
        sortable: false,
        headerAlign: 'center',
        renderCell: (params) => (
            <div className='flex w-full gap-2 h-full'>
                <ImageTag tag={params.row.car_tag} img={params.value} />
                <ImageTag tag={params.row.person_tag} img={params.value} />
            </div>
        ),
    },
    {
        field: 'licensePlate',
        headerName: 'เลขทะเบียน',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <div className='flex justify-center items-center h-full'>
                <div className='flex flex-col items-center'>
                    <Typography variant="body2" sx={{ color: params.row.isBlacklist ? 'red' : 'inherit', fontWeight: 'bold' }}>
                        {params.value.number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.value.province}
                    </Typography>

                </div>
            </div>
        )
    },
    { field: 'brand', headerName: 'ยี่ห้อ', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'color', headerName: 'สี', flex: 1, headerAlign: 'center', align: 'center' },
    {
        field: 'name',
        headerName: 'ชื่อ-นามสกุล',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <div className='flex justify-start items-center h-full'>
                <Typography variant="body2" sx={{ color: params.row.isBlacklist ? 'red' : 'inherit' }}>
                    {params.value}
                </Typography>
            </div>
        )
    },
    {
        field: 'department',
        headerName: 'หน่วยงาน',
        flex: 2,
        headerAlign: 'center',
        renderCell: (params) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                    {params.value}
                </Typography>
            </div>
        ),
    },
    {
        field: 'exp_date',
        renderHeader: () => (
            <div style={{ textAlign: 'center', whiteSpace: 'normal', lineHeight: 1.2 }}>
                <span>จำนวนวัน</span><br />
                <span>หมดอายุ</span>
            </div>
        ),
        flex: 1,
        headerAlign: 'center',

    },
];

// 2. สร้างข้อมูลตัวอย่าง (Rows)
const rows = [
    { id: 1, time: '10/10/2569 10:30:10', eventType: 'ขาเข้า', images: 'https://i.imgur.com/uP42D4I.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'กง 1442', province: 'กรุงเทพมหานคร' }, brand: 'Nissan', color: 'เทา', name: 'นายพลากร เพชรพร้อม', department: '-', isBlacklist: true },
    { id: 2, time: '10/10/2569 10:29:15', eventType: 'ขาออก', images: 'https://i.imgur.com/8A2u5vA.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: '3กน 1776', province: 'กรุงเทพมหานคร' }, brand: 'Honda', color: 'ขาว', name: 'นายอนงค์ อารมณ์ดี', department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ', isBlacklist: false },
    { id: 3, time: '10/10/2569 10:25:10', eventType: 'ขาเข้า', images: 'https://i.imgur.com/hI2CMpE.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: '66 4578', province: 'กรุงเทพมหานคร' }, brand: 'Toyota', color: 'ส้ม', name: 'นางสาวสายชล สายแก้ว', department: '-', isBlacklist: false },
    { id: 4, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 5, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 6, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 7, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'blacklist', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 8, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'blacklist', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 9, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'blacklist', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 10, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 11, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 12, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'visitor', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 13, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'visitor', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 14, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'visitor', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 15, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'visitor', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 16, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'visitor', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 17, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
    { id: 18, time: '10/10/2569 10:19:45', eventType: 'ขาออก', images: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: '', licensePlate: { number: 'ขพ 9227', province: 'อุดรธานี' }, brand: 'Isuzu', color: 'แดง', name: 'นายบุญเลิศ ค้าสารเสพสุข', department: '-', isBlacklist: true },
];

// ฟังก์ชันสำหรับกำหนด class ให้กับแถว
const getRowClassName = (params: GridRowClassNameParams) => {
    // ถ้า isBlacklist เป็น true ให้ใช้ class 'highlight-row'
    return params.row.isBlacklist ? 'highlight-row' : '';
};

const DashBoardPage = () => {
    // Popup state & detection (mock for new blacklist event)
    const [openAlert, setOpenAlert] = useState(false);
    const [alertIndex, setAlertIndex] = useState<number | null>(null);
    const lastShownIdRef = useRef<number | null>(null);

    useEffect(() => {
        const newest = rows[0];
        if (newest && newest.isBlacklist && newest.id !== lastShownIdRef.current) {
            lastShownIdRef.current = newest.id;
            const index = rows.findIndex(r => r.id === newest.id);
            setAlertIndex(index);
            setOpenAlert(true);
        }
    }, []);

    const alertData = alertIndex !== null ? rows[alertIndex] : null;

    return (
        <div className='flex flex-col  gap-4 h-full'>
            <Typography variant='h5' className='text-primary-dark '>ข้อมูลการเข้า-ออกพื้นที่ ณ ปัจจุบัน</Typography>
            <div className="flex gap-4">
                <InOutDashboard />
                <div className="flex-1 flex flex-col min-w-0">
                    <DataTable
                        rows={rows}
                        columns={columns}
                        getRowClassName={getRowClassName}

                    />
                </div>
            </div>
            {alertData && (
                <BlackListAlert
                    open={openAlert}
                    onClose={() => setOpenAlert(false)}
                    typeText={`ประเภท : ${alertData.eventType ?? 'ขาเข้า'}`}
                    dateTimeText={alertData.time}
                    vehicle={{
                        plate: alertData.licensePlate?.number ?? '-',
                        province: alertData.licensePlate?.province,
                        brand: alertData.brand,
                        color: alertData.color,
                        imageUrl: alertData.images,
                    }}
                    person={{
                        fullName: alertData.name ?? '-',
                        agency: alertData.department,
                        imageUrl: alertData.images,
                    }}
                />
            )}
        </div>
    );
};

export default DashBoardPage;

