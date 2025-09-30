// src/pages/SearchPerson.tsx

import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Avatar, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DataTable from '../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import ImageTag from '../../components/ImageTag';
import { useRef, useState } from 'react';
import dialog from '../../services/dialog.service';

// --- Data for Table ---
const columns: GridColDef[] = [
    { field: 'id', headerName: 'ลำดับ', width: 70, headerAlign: 'center', align: 'center' },
    {
        field: 'image', headerName: 'ภาพ', width: 200, headerAlign: 'center', align: 'center', sortable: false,
        renderCell: (params) => (
            <div className='flex w-full gap-2 h-full p-[1px]'>
                <ImageTag tag={params.row.car_tag} img={params.value} />
                <ImageTag tag={params.row.person_tag} img={params.value} />
            </div>
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
    { id: 1, image: 'https://i.imgur.com/8A2u5vA.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 98, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 2, image: 'https://i.imgur.com/hI2CMpE.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 95, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 3, image: 'https://i.imgur.com/uP42D4I.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 97, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 4, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 5, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'blacklist', person_tag: 'blacklist', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 6, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'blacklist', person_tag: 'blacklist', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 7, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'blacklist', person_tag: 'blacklist', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 8, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'visitor', person_tag: 'visitor', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 9, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'visitor', person_tag: 'visitor', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 10, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 11, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 12, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: '', person_tag: '', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 13, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
    { id: 14, image: 'https://i.imgur.com/1o2aY2V.png', car_tag: 'member', person_tag: 'member', name: 'นายบุญเกียรติ ศิริสวัสดิ์สุข', similarity: 90, department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ' },
];

const SearchPerson = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const clearImage = () => {
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage);
        }
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onPickFile = () => {
        fileInputRef.current?.click();
    };

    const validateFile = (file: File) => {
        const isValidType = ['image/png', 'image/jpeg'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) {
            dialog.warning('อนุญาตเฉพาะไฟล์ PNG หรือ JPEG');
            return false;
        }
        if (!isValidSize) {
            dialog.warning('ขนาดไฟล์ต้องไม่เกิน 5MB');
            return false;
        }
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!validateFile(file)) return;

        const previewUrl = URL.createObjectURL(file);
        setSelectedImage(previewUrl);


    };

    return (
        <>
            <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
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
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Box sx={{ position: 'relative', width: 120, height: 150, m: 'auto' }}>
                                    {selectedImage ? (
                                        <Avatar
                                            variant="rounded"
                                            src={selectedImage}
                                            onClick={onPickFile}
                                            sx={{ width: '100%', height: '100%', cursor: 'pointer' }}
                                        />
                                    ) : (
                                        <Box
                                            role="button"
                                            onClick={onPickFile}
                                            className="flex flex-col items-center justify-center cursor-pointer border border-dashed border-gray-300 hover:bg-gray-50"
                                            sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                                        >
                                            <CloudUploadOutlinedIcon sx={{ color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="caption" color="text.secondary">Upload รูปภาพ</Typography>
                                        </Box>
                                    )}
                                    {selectedImage && (
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            title="ล้างรูป"
                                            className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full shadow p-1"
                                            style={{ lineHeight: 0 }}
                                        >
                                            <CloseRoundedIcon fontSize="small" />
                                        </button>
                                    )}
                                </Box>
                                {/* Message and loading are now handled via dialog service */}
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

        </>
    );
};

export default SearchPerson;
