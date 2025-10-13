// src/pages/Settings/System.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, FormGroup, FormControlLabel, Checkbox, Button, Stack, IconButton, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { type GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/DataTable';
import Popup from '../../components/Popup';
import SettingsIcon from "@mui/icons-material/Settings"
import PolygonCanvas from '../../components/PolygonCanvas';
import { SettingApi } from '../../services/Setting.service';
import { CameraApi, type Camera } from '../../services/Camera.service';
import { useSelector } from 'react-redux';
import { selectGates } from '../../store/slices/masterdataSlice';
import dialog from '../../services/dialog.service';
import RestartAltIcon from "@mui/icons-material/RestartAlt"


// ✅ type สำหรับ DataTable โดยเฉพาะ
interface CameraRow {
  id: string;
  order: number;
  name: string;
  ip: string;
  gate: string;
  location: string;
  raw: Camera;
}

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
  const [polygon, setPolygon] = useState<number[]>([]);
  const [showSensorPopup, setShowSensorPopup] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<any | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CameraRow | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);

  const gates = useSelector(selectGates);


  const [cameras, setCameras] = useState<CameraRow[]>([]); // ✅ state สำหรับเก็บกล้องจาก API
  const [rebooting, setRebooting] = useState(false);
  const [rebootCountdown, setRebootCountdown] = useState(0);

  const [gateOptions, setGateOptions] = useState<{ face: boolean; plate: boolean; member: boolean }>({
    face: false,
    plate: false,
    member: false,
  });

  // โหลดค่ากล้องจาก API
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await CameraApi.getAll(1, 50);
        if (res.success && Array.isArray(res.data)) {
          // แปลงข้อมูลให้อยู่ในรูปแบบที่ DataTable ต้องการ
          const mapped = res.data.map((cam, index) => ({
            id: cam.camera_uid,
            order: index + 1,
            name: cam.camera_name,
            ip: cam.camera_ip,
            gate: cam.gate_uid ?? '-',
            location: `${cam.latitude}, ${cam.longitude}`,
            raw: cam, // เก็บของจริงไว้ใช้ภายหลัง
          }));
          setCameras(mapped);
        }
      } catch (err) {
        console.error("โหลดกล้องไม่สำเร็จ", err);
      }
    };

    fetchCameras();
  }, []);

  useEffect(() => {
    if (!showSensorPopup) {
      // ✅ รีเซ็ต canvas เมื่อ popup ปิด
      setPolygon([]);
      setDrawing(false);
      setSelectedCamera(null);
      setLastImageUrl(null);
    }
  }, [showSensorPopup]);

  // โหลด Setting เงื่อนไขบัตร/ใบหน้า/ทะเบียน
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await SettingApi.get();
        if (res.success && res.data) {
          setGateOptions(res.data[0].setting_value);
        }
      } catch (err) {
        console.error("โหลด setting ไม่ได้", err);
      }
    };
    fetchSettings();
  }, []);

  // โหลดภาพล่าสุดของกล้องเมื่อเลือกกล้อง
  useEffect(() => {
    const loadLastImage = async () => {
      if (!selectedCamera) return;
      try {
        const res = await CameraApi.getLastImage(selectedCamera.camera_uid);
        if (res.success && res.imageUrl) {
          setLastImageUrl(res.imageUrl);
        } else {
          setLastImageUrl(null);
        }
      } catch (err) {
        console.error("โหลดภาพล่าสุดไม่สำเร็จ", err);
        setLastImageUrl(null);
      }
    };
    loadLastImage();
  }, [selectedCamera]);


  const handleEditCamera = (camera: CameraRow) => {
    setEditingCamera(camera);
    const c = camera.raw;

    // กำหนดค่าให้ form
    setForm({
      name: c.camera_name,
      ip: c.camera_ip,
      gate: c.gate_uid ?? '',
      lat: c.latitude ?? '',
      lng: c.longitude ?? '',
      rtspLiveUrl: c.rtsp_live_url ?? '',
      rtspProcessUrl: c.rtsp_process_url ?? '',
      streamEncode: String(c.stream_encode_id ?? ''),
      apiServerUrl: c.api_server_url ?? '',
      liveServerUrl: c.live_server_url ?? '',
      liveStreamUrl: c.live_stream_url ?? '',
    });

    setShowCameraPopup(true);
  };

  const handleChange = (field: keyof typeof form) => (e: any) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // handle check/uncheck
  const handleChangeCheckbox = (field: keyof typeof gateOptions) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...gateOptions, [field]: e.target.checked };
    setGateOptions(newValue);

    try {
      await SettingApi.update(newValue);
      console.log("✅ PATCH updated:", newValue);
    } catch (err) {
      console.error("อัปเดต setting error:", err);
    }
  };


  const columns: GridColDef[] = [
    { field: 'order', headerName: 'ลำดับ', width: 90, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'ชื่อกล้อง', flex: 1, minWidth: 180, headerAlign: 'center' },
    { field: 'ip', headerName: 'Camera IP', flex: 1, minWidth: 180, headerAlign: 'center', align: 'center' },
    { field: 'gate', headerName: 'Gate UID', flex: 1, minWidth: 160, headerAlign: 'center', align: 'center' },
    { field: 'location', headerName: 'Location', flex: 1.2, minWidth: 220, headerAlign: 'center', align: 'center' },
    {
      field: 'censor_action',
      headerName: 'ตั้งค่าเซ็นเซอร์',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => {
            setSelectedCamera(params.row.raw); // ✅ เก็บข้อมูลจริงของกล้องไว้ใช้ใน popup
            setShowSensorPopup(true);
          }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'actions', headerName: '', width: 100, sortable: false, align: 'center',
      renderCell: (params) => (
        <div className='flex w-full h-full items-center justify-center gap-1'>
          <IconButton size="small" onClick={() => handleEditCamera(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          {/* <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton> */}
        </div>),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
        ตั้งค่าระบบ
      </Typography>

      {/* Conditions card */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <div className='w-full'>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            เงื่อนไขการเข้าพื้นที่ กรณีสมาชิก (<span className='font-light '>หมายเหตุ : กรณีอื่นๆตรวจสอบ ป้ายทะเบียน</span>)
          </Typography>
        </div>
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox checked={gateOptions.member} onChange={handleChangeCheckbox("member")} />}
            label="บัตร"
          />
          <FormControlLabel
            control={<Checkbox checked={gateOptions.face} onChange={handleChangeCheckbox("face")} />}
            label="ใบหน้าบุคคล"
          />
          <FormControlLabel
            control={<Checkbox checked={gateOptions.plate} onChange={handleChangeCheckbox("plate")} />}
            label="ป้ายทะเบียน"
          />

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
          <DataTable rows={cameras} columns={columns} disableFooter />
        </Box>
      </Paper>

      {/* Camera popup */}
      <Popup title="ข้อมูลกล้อง" show={showCameraPopup} onClose={() => setShowCameraPopup(false)}>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!editingCamera) return;

          try {
            const payload = {
              camera_name: form.name,
              camera_ip: form.ip,
              gate_uid: form.gate,
              latitude: form.lat,
              longitude: form.lng,
              rtsp_live_url: form.rtspLiveUrl,
              rtsp_process_url: form.rtspProcessUrl,
              stream_encode_id: Number(form.streamEncode) || 0,
              api_server_url: form.apiServerUrl,
              live_server_url: form.liveServerUrl,
              live_stream_url: form.liveStreamUrl,
            };

            const res = await CameraApi.update(editingCamera.raw.camera_uid, payload);
            if (res.success) {
              console.log("✅ อัปเดตกล้องสำเร็จ:", res.data);
              setShowCameraPopup(false);

              // โหลดใหม่หลังอัปเดต
              const refreshed = await CameraApi.getAll(1, 50);
              if (refreshed.success) {
                const mapped = refreshed.data.map((cam, i) => ({
                  id: cam.camera_uid,
                  order: i + 1,
                  name: cam.camera_name,
                  ip: cam.camera_ip,
                  gate: cam.gate_uid ?? '-',
                  location: `${cam.latitude}, ${cam.longitude}`,
                  raw: cam,
                }));
                setCameras(mapped);
              }
            }
          } catch (err) {
            console.error("❌ บันทึกไม่สำเร็จ", err);
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Row 1 */}
            <div className="md:col-span-2">
              <InputLabel shrink>ชื่อกล้อง</InputLabel>
              <TextField value={form.name} onChange={handleChange('name')} disabled />
            </div>
            <div className="md:col-span-1">
              <InputLabel shrink>Camera IP</InputLabel>
              <TextField value={form.ip} onChange={handleChange('ip')} disabled />
            </div>

            {/* Row 2 */}
            <div>
              <InputLabel shrink>Gate Name</InputLabel>
              <Select displayEmpty value={form.gate} onChange={handleChange('gate')} disabled>
                <MenuItem value=""><em>เลือก Gate</em></MenuItem>
                {gates.map((t) => (
                  <MenuItem key={t.gate_id} value={t.uid}>
                    {t.gate_name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <InputLabel shrink>Latitude</InputLabel>
              <TextField value={form.lat} onChange={handleChange('lat')} disabled />
            </div>
            <div>
              <InputLabel shrink>Longitude</InputLabel>
              <TextField value={form.lng} onChange={handleChange('lng')} disabled />
            </div>

            {/* Row 3 */}
            <div>
              <InputLabel shrink>Rtsp Live URL</InputLabel>
              <TextField value={form.rtspLiveUrl} onChange={handleChange('rtspLiveUrl')} disabled />
            </div>
            <div>
              <InputLabel shrink>Rtsp Process URL</InputLabel>
              <TextField value={form.rtspProcessUrl} onChange={handleChange('rtspProcessUrl')} disabled />
            </div>
            <div>
              <InputLabel shrink>Stream Encode</InputLabel>
              <Select displayEmpty value={form.streamEncode} onChange={handleChange('streamEncode')} disabled>
                <MenuItem value=""><em>เลือก Encode</em></MenuItem>
                <MenuItem value="H264">H264</MenuItem>
                <MenuItem value="H265">H265</MenuItem>
              </Select>
            </div>

            {/* Row 4 */}
            <div>
              <InputLabel shrink>API Server URL</InputLabel>
              <TextField value={form.apiServerUrl} onChange={handleChange('apiServerUrl')} disabled />
            </div>
            <div>
              <InputLabel shrink>Live Server URL</InputLabel>
              <TextField value={form.liveServerUrl} onChange={handleChange('liveServerUrl')} disabled />
            </div>
            <div>
              <InputLabel shrink>Live Stream URL</InputLabel>
              <TextField value={form.liveStreamUrl} onChange={handleChange('liveStreamUrl')} disabled />
            </div>

            {/* Actions */}
            <div className="md:col-span-3 flex justify-end pt-2">
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" className='!border-primary !text-primary' startIcon={<CloseOutlinedIcon />} onClick={() => setShowCameraPopup(false)}>ยกเลิก</Button>
                <Button type="submit" variant="contained" disabled startIcon={<SaveOutlinedIcon />} className='!bg-primary hover:!bg-primary-dark'>บันทึก</Button>
              </Stack>
            </div>
          </div>
        </Box>
      </Popup>

      {/* Setting popup */}
      <Popup
        title="ตั้งค่าเซ็นเซอร์"
        show={showSensorPopup}
        onClose={() => setShowSensorPopup(false)}

      >
        {selectedCamera && (
          <Box>

            {/* ปุ่ม control */}
            <Stack direction="row" spacing={1} mb={2} justifyContent="space-between">
              <Button
                variant="contained"
                size="small"
                className="!bg-yellow-500 hover:!bg-yellow-600"
                startIcon={<span><RestartAltIcon fontWeight="small" /></span>}
                disabled={rebooting}
                onClick={async () => {
                  if (!selectedCamera) return;

                  setRebooting(true);
                  setRebootCountdown(60); // เริ่มนับถอยหลัง 60 วินาที

                  // ✅ ตั้ง timer ให้นับลดลงทุกวินาที
                  const timer = setInterval(() => {
                    setRebootCountdown((prev) => {
                      if (prev <= 1) {
                        clearInterval(timer);
                        setRebooting(false);
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);

                  try {
                    const res = await CameraApi.rebootCamera(selectedCamera.camera_uid);
                    if (res.success) {
                      console.log("✅ รีบูตกล้องสำเร็จ:", res);
                      dialog.success(`รีบูตกล้องสำเร็จ: `);
                    } else {
                      dialog.error("รีบูตไม่สำเร็จ: " + res.message);
                    }
                  } catch (err) {
                    console.error("❌ reboot error", err);
                    dialog.error("เกิดข้อผิดพลาดระหว่างรีบูตกล้อง");
                    clearInterval(timer);
                    setRebooting(false);
                    setRebootCountdown(0);
                  }
                }}

              >
                {rebooting ? `รีบูต (${rebootCountdown}s)` : "Restart"}
              </Button>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setPolygon([])}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  className="!bg-primary hover:!bg-primary-dark"
                  onClick={() => setDrawing(true)} // เปิดโหมด plot polygon
                >
                  Start Plot Sensor
                </Button>
              </Stack>
            </Stack>

            {/* canvas */}
            <div className='flex justify-center w-full'>
              <PolygonCanvas
                imageUrl={lastImageUrl || "/imgs/car_mock_img.png"}
                polygon={polygon}
                setPolygon={setPolygon}
                drawing={drawing}
              />
            </div>

            {/* ปุ่มยกเลิก-บันทึก */}
            <Stack direction="row" spacing={1} mt={3} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setShowSensorPopup(false)}>ยกเลิก</Button>
              <Button
                variant="contained"
                className="!bg-primary hover:!bg-primary-dark"
                disabled={rebooting}
                onClick={async () => {
                  if (!selectedCamera) return;
                  if (!polygon.length) return dialog.warning("กรุณาวาด Polygon ก่อนบันทึก");

                  // ✅ แปลง polygon [x1, y1, x2, y2, ...] → [{x, y}, ...]
                  const points = [];
                  for (let i = 0; i < polygon.length; i += 2) {
                    points.push({ x: polygon[i], y: polygon[i + 1] });
                  }

                  // ✅ ปิด polygon (จุดสุดท้ายกลับไปจุดแรก)
                  if (points.length >= 3) {
                    const first = points[0];
                    const last = points[points.length - 1];
                    if (first.x !== last.x || first.y !== last.y) {
                      points.push({ ...first });
                    }
                  }

                  const payload = {
                    camera_uid: selectedCamera.camera_uid,
                    width: 1920,
                    height: 1080,
                    points,
                  };

                  try {
                    // ✅ 1. บันทึก polygon mask
                    const maskRes = await CameraApi.drawMask(payload);

                    if (maskRes.success) {
                      console.log("✅ บันทึก Polygon สำเร็จ:", maskRes.message);

                      // ✅ 2. รีบูตกล้องหลังบันทึกสำเร็จ
                      setRebooting(true);
                      setRebootCountdown(60);

                      const timer = setInterval(() => {
                        setRebootCountdown((prev) => {
                          if (prev <= 1) {
                            clearInterval(timer);
                            setRebooting(false);
                            return 0;
                          }
                          return prev - 1;
                        });
                      }, 1000);

                      const rebootRes = await CameraApi.rebootCamera(selectedCamera.camera_uid);
                      if (rebootRes.success) {
                        console.log("♻️ รีบูตกล้องสำเร็จ:", rebootRes.message);
                        dialog.confirm(`✅ บันทึกสำเร็จและรีบูตกล้องแล้ว\n${rebootRes.message}`);
                      } else {
                        dialog.error("บันทึกสำเร็จแต่รีบูตไม่สำเร็จ: " + rebootRes.message);
                      }
                    } else {
                      dialog.error("❌ บันทึกไม่สำเร็จ: " + maskRes.message);
                    }
                  } catch (err) {
                    console.error("❌ draw-mask หรือ reboot error:", err);
                    dialog.error("เกิดข้อผิดพลาดระหว่างบันทึก polygon หรือรีบูตกล้อง");
                    setRebooting(false);
                  } finally {
                    setShowSensorPopup(false);
                  }
                }}
              >
                {rebooting ? `รีบูต (${rebootCountdown}s)` : "บันทึก"}
              </Button>
            </Stack>
          </Box>
        )}
      </Popup>
    </Box>
  );
};

export default SystemSettings;
