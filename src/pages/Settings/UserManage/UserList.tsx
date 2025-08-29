// src/pages/Settings/UserManage/UserList.tsx
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, Select, MenuItem, Button, Stack, Chip, IconButton, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../../components/DataTable';
import { type GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

// Mock data
const rows = [
  { id: 1, order: 1, fullName: 'นายปกป้อง เก่งกล้าทาทู', position: 'เจ้าหน้าที่ศูนย์ข้อมูลกลาง', department: 'สำนักงานศูนย์ทรัพย์สิน', status: 'Active' },
  { id: 2, order: 2, fullName: 'นางสาวอชิช สริสาร์', position: 'เจ้าหน้าที่ศูนย์ข้อมูลกลาง', department: 'สำนักงานศูนย์ทรัพย์สิน', status: 'Active' },
  { id: 3, order: 3, fullName: 'นายเจริญชัย ยิ่งยวด', position: 'เจ้าหน้าที่ศูนย์ข้อมูลกลาง', department: 'สำนักงานศูนย์ทรัพย์สิน', status: 'Active' },
  { id: 4, order: 4, fullName: 'นายดนุภพ สุขดี', position: 'เจ้าหน้าที่ศูนย์ข้อมูลกลาง', department: 'สำนักงานศูนย์ทรัพย์สิน', status: 'Active' },
  { id: 5, order: 5, fullName: 'นางพรพิทิต ศรีดี', position: 'เจ้าหน้าที่ศูนย์ข้อมูลกลาง', department: 'สำนักงานศูนย์ทรัพย์สิน', status: 'Inactive' },
];

const UserListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: 'order', headerName: 'ลำดับ', width: 90, headerAlign: 'center', align: 'center' },
    { field: 'fullName', headerName: 'ชื่อ-นามสกุล', flex: 1.4, minWidth: 220, headerAlign: 'center' },
    { field: 'position', headerName: 'ตำแหน่ง', flex: 1.2, minWidth: 200, headerAlign: 'center' },
    { field: 'department', headerName: 'หน่วยงาน', flex: 1.2, minWidth: 200, headerAlign: 'center' },
    {
      field: 'status', headerName: 'สถานะการใช้งาน', width: 160, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Active' ? 'success' : 'default'}
          variant={params.value === 'Active' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions', headerName: '', width: 100, sortable: false, align: 'center',
      renderCell: () => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => navigate('/settings/usermanage/userinfo')}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
        จัดการสิทธิ์การใช้งาน
      </Typography>

      {/* Search panel */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>Search</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'white' }}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap -m-2">
              <div className="w-full md:w-1/4 p-2">
                <InputLabel shrink>ชื่อ</InputLabel>
                <TextField placeholder="ชื่อ" />
              </div>
              <div className="w-full md:w-1/4 p-2">
                <InputLabel shrink>นามสกุล</InputLabel>
                <TextField placeholder="นามสกุล" />
              </div>
              <div className="w-full md:w-1/4 p-2">
                <InputLabel shrink>หน่วยงาน</InputLabel>
                <Select displayEmpty defaultValue="">
                  <MenuItem value=""><em>ทุกหน่วยงาน</em></MenuItem>
                </Select>
              </div>
              <div className="w-full md:w-1/4 p-2">
                <InputLabel shrink>สถานะผู้ใช้งาน</InputLabel>
                <Select displayEmpty defaultValue="">
                  <MenuItem value=""><em>ทุกประเภท</em></MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </div>
            </div>
            <div className="w-full flex justify-end p-2">
              <Button variant="contained" startIcon={<SearchIcon />} className='!bg-primary hover:!bg-primary-dark'>ค้นหา</Button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate('/settings/usermanage/userinfo')} className='!bg-gold hover:!bg-gold-dark'>ผู้ใช้งาน</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>ผลการค้นหา : 10 รายการ</Typography>
      </Stack>

      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};

export default UserListPage;
