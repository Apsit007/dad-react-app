import {
  Accordion, AccordionSummary, AccordionDetails,
  InputLabel, TextField, Select, MenuItem, Button,
  Box, Stack, Typography, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useNavigate } from 'react-router-dom';
import { type GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../components/DataTable';
import ImageTag from '../../../components/ImageTag';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ลำดับ', width: 70, headerAlign: 'center', align: 'center' },
  {
    field: 'image',
    headerName: 'ภาพ',
    width: 200,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: (params) => (
      <div className="flex w-full gap-2 h-full p-[1px]">
        <ImageTag tag={params.row.person_tag} img={params.value} />
        <ImageTag tag={params.row.car_tag} img={params.value} />
      </div>
    ),
  },
  { field: 'name', headerName: 'ชื่อ-นามสกุล', flex: 1, minWidth: 200, headerAlign: 'center' },
  { field: 'similarity', headerName: '% ความคล้ายคลึง', width: 150, headerAlign: 'center', align: 'center' },
  { field: 'department', headerName: 'หน่วยงาน', flex: 1, minWidth: 200, headerAlign: 'center' },
  { field: 'plate', headerName: 'หมายเลขรถ', flex: 1, minWidth: 180, headerAlign: 'center' },
  { field: 'brand', headerName: 'ยี่ห้อ', flex: 1, minWidth: 140, headerAlign: 'center' },
  { field: 'color', headerName: 'สี', width: 120, headerAlign: 'center', align: 'center' },
  { field: 'found_time', headerName: 'เวลาที่พบ', width: 150, headerAlign: 'center', align: 'center' },
];

const rows = [
  {
    id: 1,
    image: 'https://i.imgur.com/8A2u5vA.png',
    person_tag: 'Member',
    car_tag: '',
    name: 'นายบุญมีทรัพย์ ดีมีสินสุข',
    similarity: 98,
    department: 'สำนักงานสภาที่ปรึกษาเศรษฐกิจและสังคมแห่งชาติ',
    plate: '2กก 6677 กรุงเทพมหานคร',
    brand: 'Nissan',
    color: 'น้ำตาล',
    found_time: '00:10:10',
  },
  {
    id: 2,
    image: 'https://i.imgur.com/8A2u5vA.png',
    person_tag: 'Member',
    car_tag: '',
    name: 'นายบุญมีทรัพย์ ดีมีสินสุข',
    similarity: 95,
    department: 'สำนักงานสภาที่ปรึกษาเศรษฐกิจและสังคมแห่งชาติ',
    plate: '2กก 6677 กรุงเทพมหานคร',
    brand: 'Honda',
    color: 'ขาว',
    found_time: '00:20:10',
  },
  {
    id: 3,
    image: 'https://i.imgur.com/8A2u5vA.png',
    person_tag: 'Member',
    car_tag: '',
    name: 'นายบุญมีทรัพย์ ดีมีสินสุข',
    similarity: 90,
    department: 'สำนักงานสภาที่ปรึกษาเศรษฐกิจและสังคมแห่งชาติ',
    plate: '2กก 6677 กรุงเทพมหานคร',
    brand: 'Nissan',
    color: 'น้ำตาล',
    found_time: '00:22:10',
  },
  {
    id: 4,
    image: 'https://i.imgur.com/8A2u5vA.png',
    person_tag: 'VIP',
    car_tag: 'Member',
    name: 'นายบุญมีทรัพย์ ดีมีสินสุข',
    similarity: 90,
    department: 'สำนักงานสภาที่ปรึกษาเศรษฐกิจและสังคมแห่งชาติ',
    plate: '2กก 6677 กรุงเทพมหานคร',
    brand: 'Hyundia',
    color: 'ขาว',
    found_time: '00:40:10',
  },
];

const VideoResultPage = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box className="flex items-center gap-2 mb-2" key={'back-btn-result'}>
        <IconButton
          onClick={() => navigate(-1)}
          className="!text-primary"
          size="small"
        >
          <ArrowBackIosNewRoundedIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }} className="text-primary-dark">
          อัปโหลด VDO/ค้นหาด้วย VDO
        </Typography>
      </Box>

      {/* Search Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>Search</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'white' }}>
          <div className="flex flex-wrap -m-2">
            <div className="w-full sm:w-1/3 p-2">
              <InputLabel shrink>ชื่อ</InputLabel>
              <TextField placeholder="ชื่อ" fullWidth />
            </div>
            <div className="w-full sm:w-1/3 p-2">
              <InputLabel shrink>นามสกุล</InputLabel>
              <TextField placeholder="นามสกุล" fullWidth />
            </div>
            <div className="w-full sm:w-1/3 p-2">
              <InputLabel shrink>ประเภทบุคคล</InputLabel>
              <Select defaultValue="" fullWidth>
                <MenuItem value="">
                  <em>ทุกประเภท</em>
                </MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="visitor">Visitor</MenuItem>
              </Select>
            </div>
            <div className="w-full sm:w-1/3 p-2">
              <InputLabel shrink>หมายเลขทะเบียน</InputLabel>
              <TextField placeholder="หมายเลขทะเบียน" fullWidth />
            </div>
            <div className="w-full sm:w-1/3 p-2">
              <InputLabel shrink>หมายเลขจังหวัด</InputLabel>
              <Select defaultValue="" fullWidth>
                <MenuItem value="">
                  <em>ทั้งหมด</em>
                </MenuItem>
                <MenuItem value="bkk">กรุงเทพมหานคร</MenuItem>
                <MenuItem value="pt">ปทุมธานี</MenuItem>
              </Select>
            </div>
            <div className="w-full sm:w-1/3 p-2">
              <InputLabel shrink>ประเภทการจดทะเบียน</InputLabel>
              <Select defaultValue="" fullWidth>
                <MenuItem value="">
                  <em>ทุกประเภท</em>
                </MenuItem>
                <MenuItem value="private">บุคคลธรรมดา</MenuItem>
                <MenuItem value="company">นิติบุคคล</MenuItem>
              </Select>
            </div>
          </div>
          <div className="w-full flex justify-end p-2">
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              className="!bg-primary hover:!bg-primary-dark"
            >
              ค้นหา
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Export buttons + result count */}
      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/txt-file.png' />}>TXT</Button>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/xls-file.png' />}>XLS</Button>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/csv-file.png' />}>CSV</Button>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/pdf-file.png' />}>PDF</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>
          ผลการค้นหา : {rows.length} รายการ
        </Typography>
      </Stack>

      {/* DataTable */}
      <div className="flex-1 flex flex-col">
        <DataTable rows={rows} columns={columns} />
      </div>
    </Box>
  );
};

export default VideoResultPage;
