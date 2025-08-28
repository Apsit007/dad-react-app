// src/pages/PersonInfo/PersonInfoList.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Avatar, Chip, Stack, InputLabel, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from '../../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import { useNavigate, NavLink } from 'react-router-dom';

// --- Table Columns Definition ---
const columns: GridColDef[] = [
    { field: 'id', headerName: 'ลำดับ', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'cardHex', headerName: 'Card Number (Hex)', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    { field: 'cardCode', headerName: 'Card Code', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    {
        field: 'image', headerName: 'ภาพใบหน้า', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center', sortable: false,
        renderCell: (params) => <Avatar src={params.value} />
    },
    { field: 'name', headerName: 'ชื่อ-นามสกุล', flex: 1.5, minWidth: 200, headerAlign: 'center' },
    { field: 'idCard', headerName: 'เลขบัตรประชาชน', flex: 1.5, minWidth: 200, headerAlign: 'center' },
    { field: 'department', headerName: 'หน่วยงาน', flex: 1.5, minWidth: 250, headerAlign: 'center' },
    { field: 'createDate', headerName: 'วันที่สร้าง', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
    {
        field: 'personType', headerName: 'ประเภทบุคคล', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center',
        renderCell: (params) => {
            const typeMap = {
                Visitor: { label: 'Visitor', color: 'info' as const },
                Member: { label: 'Member', color: 'warning' as const },
                Blacklist: { label: 'Blacklist', color: 'error' as const },
                VIP: { label: 'VIP', color: 'success' as const }
            };
            const type = typeMap[params.value as keyof typeof typeMap] || { label: params.value, color: 'default' as const };
            return <Chip label={type.label} size="small" color={type.color} />;
        }
    },
    {
        field: 'actions', headerName: '', width: 100, sortable: false, align: 'center',
        renderCell: () => (
            <Stack direction="row">
                <IconButton size="small" component={NavLink} to="/info/person/form"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
            </Stack>
        )
    }
];

// --- Mock Data ---
const rows = [
    { id: 1, cardHex: '124-XXXXXX', cardCode: 'NXXXX-1235', image: 'https://i.imgur.com/hI2CMpE.png', name: 'นายนาฬิกา เดินดี', idCard: '3440899828907', department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ', createDate: '10/10/2568', personType: 'Visitor' },
    { id: 2, cardHex: '125-XXXXXX', cardCode: 'NXXXX-1236', image: 'https://i.imgur.com/8A2u5vA.png', name: 'นายชายชาญ ศรีใส', idCard: '3440898892079', department: 'สำนักงานไอที', createDate: '10/10/2568', personType: 'Member' },
    { id: 3, cardHex: '126-XXXXXX', cardCode: 'NXXXX-1237', image: 'https://i.imgur.com/1o2aY2V.png', name: 'นายสุขสบายดี มีโชคดีตลอดสุข', idCard: '3440829800708', department: 'สำนักงานบริการวิเทศธนกิจและสังคมแห่งชาติ', createDate: '10/10/2568', personType: 'Visitor' },
    { id: 4, cardHex: '127-XXXXXX', cardCode: 'NXXXX-1238', image: 'https://i.imgur.com/uP42D4I.png', name: 'นายสายธาร ทองจันทร์', idCard: '34408989907829', department: '', createDate: '10/10/2568', personType: 'Blacklist' },
    { id: 5, cardHex: '128-XXXXXX', cardCode: 'NXXXX-1239', image: 'https://i.imgur.com/hI2CMpE.png', name: 'นายสมาน แก้วเขียว', idCard: '3440899782860', department: 'สำนักงานบริการธุรกิจ กระทรวงยุติธรรม', createDate: '10/10/2568', personType: 'VIP' },
];

const PersonInfoList = () => {
    const navigate = useNavigate();
    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                ข้อมูลบุคคล
            </Typography>

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>Search</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'white' }}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap -m-2">
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>ชื่อ</InputLabel>
                                <TextField placeholder="ชื่อ" />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>นามสกุล</InputLabel>
                                <TextField placeholder="นามสกุล" />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>หน่วยงาน</InputLabel>
                                <TextField placeholder="หน่วยงาน" />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>ประเภทบุคคล</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (เริ่มต้น)</InputLabel>
                                <DatePicker />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (สิ้นสุด)</InputLabel>
                                <DatePicker />
                            </div>
                        </div>
                        <div className="w-full flex justify-end p-2">
                            <Button variant="contained" startIcon={<SearchIcon />} className='!bg-gold hover:!bg-gold-dark'>
                                ค้นหา
                            </Button>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate('/info/person/form')} className='!bg-gold hover:!bg-gold-dark'>บุคคล</Button>
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

export default PersonInfoList;

