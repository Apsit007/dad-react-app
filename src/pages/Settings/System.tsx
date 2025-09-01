// src/pages/Settings/System.tsx
import { useState } from 'react';
import { Box, Typography, Paper, FormGroup, FormControlLabel, Checkbox, Button, Stack, IconButton, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { type GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/DataTable';
import Popup from '../../components/Popup';

// Mock camera list
const rows = [
  { id: 1, order: 1, name: 'Camrea_101', ip: '192.168.1.100', gate: 'ประตูเข้า', location: '14.450688,101.154816' },
  { id: 2, order: 2, name: 'Camrea_102', ip: '192.168.1.100', gate: 'ประตูออก', location: '14.450688,105.154817' },
];

const columns: GridColDef[] = [
  { field: 'order', headerName: 'ลำดับ', width: 90, headerAlign: 'center', align: 'center' },
  { field: 'name', headerName: 'ชื่อกล้อง', flex: 1, minWidth: 180, headerAlign: 'center' },
  { field: 'ip', headerName: 'Camera IP', flex: 1, minWidth: 180, headerAlign: 'center', align: 'center' },
  { field: 'gate', headerName: 'Gate Name', flex: 1, minWidth: 160, headerAlign: 'center', align: 'center' },
  { field: 'location', headerName: 'Location', flex: 1.2, minWidth: 220, headerAlign: 'center', align: 'center' },
  {
    field: 'actions', headerName: '', width: 100, sortable: false, align: 'center',
    renderCell: () => (
      <div className='flex w-full h-full items-center justify-center gap-1'>
        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
        {/* <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton> */}
      </div>
    ),
  },
];

const SystemSettings = () => {
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    ip: '',
    gate: '',
    lat: '',
    lng: '',
    rtspLiveUrl: '',
    rtspProcessUrl: '',
    streamEncode: '',
    apiServerUrl: '',
    liveServerUrl: '',
    liveStreamUrl: '',
  });

  const handleChange = (field: keyof typeof form) => (e: any) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
        ตั้งค่าระบบ
      </Typography>

      {/* Conditions card */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          เงื่อนไขการเข้าพื้นที่
        </Typography>
        <FormGroup row>
          <FormControlLabel control={<Checkbox defaultChecked />} label="บัตร" />
          <FormControlLabel control={<Checkbox defaultChecked />} label="ใบหน้าบุคคล" />
          <FormControlLabel control={<Checkbox defaultChecked />} label="ป้ายทะเบียน" />
        </FormGroup>
      </Paper>

      {/* Camera settings header */}
      <Stack direction="column" alignItems="start" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          การตั้งค่ากล้อง
        </Typography>
        {/* <Button
          variant="contained"
          size='small'
          startIcon={<AddIcon />}
          className='!bg-gold hover:!bg-gold-dark'
          sx={{ textTransform: 'none' }}
          onClick={() => setShowCameraPopup(true)}
        >
          Camera
        </Button> */}
      </Stack>

      {/* Camera table */}
      <Paper variant="outlined" sx={{ p: 0 }}>
        <Box sx={{ height: 420 }}>
          <DataTable rows={rows} columns={columns} />
        </Box>
      </Paper>

      {/* Camera popup */}
      <Popup title="ข้อมูลกล้อง" show={showCameraPopup} onClose={() => setShowCameraPopup(false)}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); setShowCameraPopup(false); }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Row 1 */}
            <div className="md:col-span-2">
              <InputLabel shrink>ชื่อกล้อง</InputLabel>
              <TextField value={form.name} onChange={handleChange('name')} />
            </div>
            <div className="md:col-span-1">
              <InputLabel shrink>Camera IP</InputLabel>
              <TextField value={form.ip} onChange={handleChange('ip')} />
            </div>

            {/* Row 2 */}
            <div>
              <InputLabel shrink>Gate Name</InputLabel>
              <Select displayEmpty value={form.gate} onChange={handleChange('gate')}>
                <MenuItem value=""><em>เลือก Gate</em></MenuItem>
                <MenuItem value="ประตูเข้า">ประตูเข้า</MenuItem>
                <MenuItem value="ประตูออก">ประตูออก</MenuItem>
              </Select>
            </div>
            <div>
              <InputLabel shrink>Latitude</InputLabel>
              <TextField value={form.lat} onChange={handleChange('lat')} />
            </div>
            <div>
              <InputLabel shrink>Longitude</InputLabel>
              <TextField value={form.lng} onChange={handleChange('lng')} />
            </div>

            {/* Row 3 */}
            <div>
              <InputLabel shrink>Rtsp Live URL</InputLabel>
              <TextField value={form.rtspLiveUrl} onChange={handleChange('rtspLiveUrl')} />
            </div>
            <div>
              <InputLabel shrink>Rtsp Process URL</InputLabel>
              <TextField value={form.rtspProcessUrl} onChange={handleChange('rtspProcessUrl')} />
            </div>
            <div>
              <InputLabel shrink>Stream Encode</InputLabel>
              <Select displayEmpty value={form.streamEncode} onChange={handleChange('streamEncode')}>
                <MenuItem value=""><em>เลือก Encode</em></MenuItem>
                <MenuItem value="H264">H264</MenuItem>
                <MenuItem value="H265">H265</MenuItem>
              </Select>
            </div>

            {/* Row 4 */}
            <div>
              <InputLabel shrink>API Server URL</InputLabel>
              <TextField value={form.apiServerUrl} onChange={handleChange('apiServerUrl')} />
            </div>
            <div>
              <InputLabel shrink>Live Server URL</InputLabel>
              <TextField value={form.liveServerUrl} onChange={handleChange('liveServerUrl')} />
            </div>
            <div>
              <InputLabel shrink>Live Stream URL</InputLabel>
              <TextField value={form.liveStreamUrl} onChange={handleChange('liveStreamUrl')} />
            </div>

            {/* Actions */}
            <div className="md:col-span-3 flex justify-end pt-2">
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" className='!border-primary !text-primary' startIcon={<CloseOutlinedIcon />} onClick={() => setShowCameraPopup(false)}>ยกเลิก</Button>
                <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} className='!bg-primary hover:!bg-primary-dark'>บันทึก</Button>
              </Stack>
            </div>
          </div>
        </Box>
      </Popup>
    </Box>
  );
};

export default SystemSettings;
