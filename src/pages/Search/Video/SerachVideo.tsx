// src/pages/Search/SerachVideo.tsx
import { useRef, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { type GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../components/DataTable';
import dialog from '../../../service/dialog.service';
import Popup from '../../../components/Popup';
import { useNavigate } from 'react-router-dom';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ลำดับ', width: 90, headerAlign: 'center', align: 'center' },
  { field: 'video_name', headerName: 'ชื่อวิดีโอ', flex: 1.5, minWidth: 220, headerAlign: 'center' },
  { field: 'uploaded_at', headerName: 'วันที่อัพโหลดวิดีโอ', flex: 1.2, minWidth: 180, headerAlign: 'center', align: 'center' },
  { field: 'expired_at', headerName: 'วันที่วิดีโอหมดอายุ', flex: 1.2, minWidth: 180, headerAlign: 'center', align: 'center' },
  { field: 'status', headerName: 'สถานะการอัพโหลด', flex: 1, minWidth: 160, headerAlign: 'center', align: 'center' },
  { field: 'uploader', headerName: 'ชื่อผู้ที่อัพโหลด', flex: 1, minWidth: 160, headerAlign: 'center' },
];

const rows: any[] = [];

const SerachVideo = () => {
  const navigate = useNavigate();
  const [videoName, setVideoName] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onPickFile = () => fileInputRef.current?.click();

  const validateFile = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      dialog.warning('อนุญาตเฉพาะไฟล์วิดีโอเท่านั้น');
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;
    setSelectedVideo(file);
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      dialog.warning('โปรดเลือกไฟล์วิดีโอ');
      return;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
        อัพโหลด VDO
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>Search</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'white' }}>
          <div className="flex flex-wrap">
            {/* Upload Box */}
            <div className="w-full md:w-1/6 p-2 text-center">
              <input ref={fileInputRef} type='file' accept='video/*' className='hidden' onChange={handleFileChange} />
              <Box
                role='button'
                onClick={() => setShowUploadPopup(true)}
                className='flex flex-col items-center justify-center cursor-pointer border border-dashed border-gray-300 hover:bg-gray-50'
                sx={{ width: 120, height: 150, m: 'auto', borderRadius: 1 }}
              >
                <CloudUploadOutlinedIcon sx={{ color: 'text.secondary', mb: 1 }} />
                <Typography variant='caption' color='text.secondary'>Upload VDO</Typography>
                {selectedVideo && (
                  <Typography variant='caption' sx={{ mt: 1 }} color='text.secondary'>
                    {selectedVideo.name}
                  </Typography>
                )}
              </Box>
            </div>

            {/* Search Fields */}
            <div className="w-full md:w-5/6 p-2">
              <div className="flex flex-wrap -m-2">
                <div className="w-full sm:w-1/3 p-2">
                  <Typography variant='caption'>ชื่อวิดีโอ</Typography>
                  <TextField placeholder='ชื่อวิดีโอ' fullWidth value={videoName} onChange={(e) => setVideoName(e.target.value)} />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <Typography variant='caption'>วันที่เริ่มต้น</Typography>
                  <DatePicker value={startDate} onChange={(d) => setStartDate(d)} />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <Typography variant='caption'>วันที่สิ้นสุด</Typography>
                  <DatePicker value={endDate} onChange={(d) => setEndDate(d)} />
                </div>
              </div>
              <div className="w-full flex justify-end p-2">
                <Button variant="contained" startIcon={<SearchIcon />} className='!bg-primary hover:!bg-primary-dark'>ค้นหา</Button>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

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

      <div className="flex-1 flex flex-col ">
        <DataTable rows={rows} columns={columns} onRowClick={() => navigate('/search/video/videoresult')} />
      </div>

      <Popup title="อัพไฟล์วิดีโอ" show={showUploadPopup} onClose={() => setShowUploadPopup(false)}>
        <Box sx={{ minWidth: 420 }}>
          <div className="flex flex-col gap-5">
            <div>
              <Typography variant='body2' className='!text-primary !mb-3'>อัพโหลดวิดีโอ</Typography>
              <div className='w-1/3 flex gap-2'>
                <TextField fullWidth value={selectedVideo?.name || ''} placeholder='ยังไม่ได้เลือกไฟล์' InputProps={{ readOnly: true }} />
                <Button variant='contained' className='!bg-primary hover:!bg-primary-dark' onClick={onPickFile} startIcon={<ArrowForwardIosRoundedIcon fontSize='small' />}>เลือก</Button>
              </div>
            </div>
            <div>
              <Typography variant='body2' className='!text-primary !mb-3'>ชื่อวิดีโอ</Typography>
              <TextField placeholder='ชื่อวิดีโอ' value={videoName} onChange={(e) => setVideoName(e.target.value)} />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outlined' className='!border-primary !text-primary' onClick={() => setShowUploadPopup(false)} startIcon={<CloseOutlinedIcon />}>ยกเลิก</Button>
              <Button variant='contained' className='!bg-primary hover:!bg-primary-dark' onClick={handleUpload} startIcon={<FileUploadOutlinedIcon />}>อัพโหลด</Button>
            </div>
          </div>
        </Box>
      </Popup>
    </Box>
  );
};

export default SerachVideo;
