import {
  Accordion, AccordionSummary, AccordionDetails,
  InputLabel, TextField, Select, MenuItem, Button,
  Box, Stack, Typography, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { type GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../components/DataTable';
import ImageTag from '../../../components/ImageTag';
import { useState, useEffect } from 'react';
import dialog from '../../../services/dialog.service';
import { LprDataApi } from '../../../services/LprData.service';
import { useSelector } from 'react-redux';
import { selectRegions, selectVehicleGroups } from '../../../store/slices/masterdataSlice';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { exportData } from '../../../services/Export.service';
import dayjs from 'dayjs';
import ImageViewer from '../../../components/ImageViewer';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
} from '@mui/material';




// 🟢 สำหรับ PDF export (คอลัมน์เรียบง่าย)
const columnsExport = [
  { field: 'overview_image_url', headerName: 'ภาพรถ' },
  { field: 'plate_image_url', headerName: 'ภาพทะเบียน' },
  { field: 'member_image_url', headerName: 'ภาพคนขับ' },
  { field: 'plate', headerName: 'เลขทะเบียน' },
  { field: 'region_th', headerName: 'หมวดจังหวัด' },
  { field: 'vehicle_make', headerName: 'ยี่ห้อ' },
  { field: 'vehicle_color_th', headerName: 'สี' },
  { field: 'vehicle_group_th', headerName: 'ประเภทกลุ่มรถ' },
  { field: 'name', headerName: 'ชื่อ-นามสกุล' },
  { field: 'member_group_th', headerName: 'ประเภทบุคคล' },
  { field: 'department_name', headerName: 'หน่วยงาน' },
];

const VideoResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ค่าที่ถูกส่งมาจากหน้า SearchVideo
  const { video_id } = location.state || {};

  const [rows, setRows] = useState<any[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState<number | undefined>(0);
  const [sPlate, setSPlate] = useState<string>('');
  const [sRegionCode, setSRegionCode] = useState<string>('');
  const [sVehicleGroupId, setSVehicleGroupId] = useState<number | ''>('');

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  const groups = useSelector(selectVehicleGroups);
  const regions = useSelector(selectRegions);

  // --- Export Dialog States ---
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"txt" | "xlsx" | "csv" | "pdf" | null>(null);
  const [exportLimit, setExportLimit] = useState<number>(100);
  const [loading, setLoading] = useState(false);


  // ✅ เปิด popup export
  const openExportPopup = (type: "txt" | "xlsx" | "csv" | "pdf") => {
    setExportType(type);
    setOpenExportDialog(true);
  };

  // ✅ เมื่อยืนยันใน popup
  const handleConfirmExport = async () => {
    if (!exportLimit || exportLimit <= 0) {
      dialog.warning("กรุณาระบุจำนวนรายการที่ต้องการส่งออก");
      return;
    }

    try {
      setLoading(true);
      dialog.loading("กำลังดึงข้อมูลสำหรับส่งออก...");

      // ✅ รวม filter ปัจจุบันทั้งหมด
      const params = {
        video_id,
        plate: sPlate ? sPlate + "*" : undefined,
        region_code: sRegionCode || undefined,
        vehicle_group_id: sVehicleGroupId === '' ? undefined : Number(sVehicleGroupId),
        page: 1,
        limit: exportLimit,
        orderBy: "id.desc",
      };

      const res = await LprDataApi.getVideoResults(params);
      dialog.close();

      if (!res.success || !res.data?.length) {
        dialog.warning("ไม่พบข้อมูลสำหรับส่งออก");
        return;
      }

      const data = res.data || [];

      if (exportType === "pdf") {
        const processedRows = data.map((r, i) => ({
          ...r,
          licensePlate: `${r.plate || ""} ${r.region_th || ""}`,
          name: `${r.member_firstname || ""} ${r.member_lastname || ""}`.trim() || "-",
        }));
        exportData(processedRows, "pdf", "video_result_list", columnsExport);
      } else {
        exportData(prepareExportRows(data), exportType!, "video_result_list");
      }

    } catch (err) {
      dialog.close();
      console.error("❌ Export error:", err);
      dialog.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    } finally {
      setLoading(false);
      setOpenExportDialog(false);
    }
  };

  useEffect(() => {
    if (video_id) {
      fetchResults();
    } else {
      dialog.warning("ไม่มีข้อมูลเวลาเริ่มและเวลาสิ้นสุดการประมวลผล");
    }
  }, []);

  const fetchResults = async (page = paginationModel.page, pageSize = paginationModel.pageSize) => {
    try {
      dialog.loading("กำลังโหลดข้อมูลผลลัพธ์...");
      const res = await LprDataApi.getVideoResults({
        video_id, // 🟢 จำเป็น
        plate: sPlate ? sPlate + "*" : undefined, // 🔸 กรองตามหมายเลขทะเบียน
        region_code: sRegionCode || undefined, // 🔸 กรองตามจังหวัด
        vehicle_group_id: sVehicleGroupId === '' ? undefined : Number(sVehicleGroupId), // 🔸 กรองตามกลุ่มรถ
        page: page + 1, // backend เริ่มนับจาก 1
        limit: pageSize,
        orderBy: "id.desc",
      });
      dialog.close();

      if (res.success) {
        setRows(res.data);
        setRowCount(res.pagination?.countAll ?? res.data.length);
      } else {
        dialog.warning("ไม่พบข้อมูลผลลัพธ์จากวิดีโอ");
      }
    } catch (err) {
      dialog.close();
      dialog.error("เกิดข้อผิดพลาดระหว่างโหลดผลลัพธ์");
      console.error(err);
    }
  };
  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setPaginationModel(model);
    fetchResults(model.page, model.pageSize);
  };

  // ✅ ฟังก์ชัน export
  const handleExport = (type: "txt" | "xlsx" | "csv" | "pdf") => {
    if (!rows.length) return dialog.warning("ไม่มีข้อมูลให้ส่งออก");

    if (type === "pdf") {
      const processedRows = rows.map((r, i) => ({
        ...r,
        licensePlate: `${r.plate || ""} ${r.region_th || ""}`,
        name: `${r.member_firstname || ""} ${r.member_lastname || ""}`.trim() || "-",
      }));
      exportData(processedRows, "pdf", "video_result_list", columnsExport);
    } else {
      exportData(prepareExportRows(rows), type, "video_result_list");
    }
  };

  // ✅ เตรียมข้อมูลก่อน export
  const prepareExportRows = (rows: any[]) => {
    return rows.map((r, i) => ({
      ลำดับ: i + 1,
      "เลขทะเบียน": `${r.plate ?? '-'} ${r.region_th ?? ''}`.trim() || "-",
      "ยี่ห้อ": r.vehicle_make ?? "-",
      "สี": r.vehicle_color_th ?? "-",
      "ประเภทกลุ่มรถ": r.vehicle_group_th ?? "-",
      "ชื่อ-นามสกุล": `${r.member_firstname ?? ''} ${r.member_lastname ?? ''}`.trim() || "-",
      "ประเภทบุคคล": r.member_group_th ?? "-",
      "หน่วยงาน": r.department_name ?? "-",
      "วันที่บันทึก": r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY HH:mm:ss") : "-",
    }));
  };

  const columns: GridColDef[] = [


    {
      field: 'images',
      headerName: 'ภาพ',
      flex: 2,
      sortable: false,
      headerAlign: 'center',
      renderCell: (params) => {
        const overviewImg = params.row.overview_image_url ?? '';
        const plateImg = params.row.plate_image_url ?? '';
        const memberImg = params.row.member_image_url ?? '';

        const imgList = [overviewImg, plateImg, memberImg].filter(Boolean);

        return (
          <div
            className="flex w-full gap-2 h-full cursor-pointer"
            onClick={() => {
              if (imgList.length > 0) {
                setViewerImages(imgList);
                setViewerOpen(true);
              }
            }}
          >
            <ImageTag tag={params.row.vehicle_group_en} img={overviewImg} disableViewImg />
            <ImageTag tag={params.row.vehicle_group_en} img={plateImg} disableViewImg />
            <ImageTag tag={params.row.member_group_en} img={memberImg} disableViewImg />
          </div>
        );
      },
    },
    {
      field: 'plate',
      headerName: 'เลขทะเบียน',
      flex: 2,
      headerAlign: 'center',
      align: 'center'

    },
    {
      field: 'region_th',
      headerName: 'หมวดจังหวัด',
      flex: 2,
      headerAlign: 'center',
      align: 'center'

    },
    { field: 'vehicle_make', headerName: 'ยี่ห้อ', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'vehicle_color_th', headerName: 'สี', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'name',
      headerName: 'ชื่อ-นามสกุล',
      flex: 2,
      headerAlign: 'center',
      renderCell: (params) => (
        <div className='flex justify-center items-center h-full'>
          <Typography variant="body2" sx={{ color: params.row.member_group_en === 'blacklist' ? 'red' : 'inherit' }}>
            {params.row.member_firstname || params.row.member_firstname ? params.row.member_firstname + ' ' + params.row.member_lastname : '-'}
          </Typography>
        </div>
      )
    },
    {
      field: 'department_name',
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
            {params.value ?? '-'}
          </Typography>
        </div>
      ),
    },
  ];

  return (
    <>
      <Box>
        <Box className="flex items-center gap-2 mb-2" key={'back-btn-result'}>
          <IconButton
            onClick={() => navigate(-1)}
            className="!text-primary"
            size="small"
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }} className="text-primary-dark !mt-[5px]">
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
                <InputLabel shrink>หมายเลขทะเบียน</InputLabel>
                <TextField placeholder="หมายเลขทะเบียน" fullWidth
                  value={sPlate}
                  onChange={(e) => setSPlate(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/3 p-2">
                <InputLabel shrink>หมายเลขจังหวัด</InputLabel>
                <Select
                  value={sRegionCode}
                  onChange={(e) => setSRegionCode(e.target.value as string)}
                  displayEmpty
                >
                  <MenuItem value=""><em>ทุกจังหวัด</em></MenuItem>
                  {regions.map(r => (
                    <MenuItem key={r.id} value={r.region_code}>{r.name_th}</MenuItem>
                  ))}
                </Select>
              </div>
              <div className="w-full sm:w-1/3 p-2">
                <InputLabel shrink>กลุ่มรถ</InputLabel>
                <Select
                  value={sVehicleGroupId}
                  onChange={(e) => setSVehicleGroupId(e.target.value as unknown as number | '')}
                  displayEmpty
                >
                  <MenuItem value=""><em>ทุกกลุ่ม</em></MenuItem>
                  {groups.map(g => (
                    <MenuItem key={g.id} value={g.id}>{g.name_th}  ({g.name_en})</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
            <div className="w-full flex justify-end gap-2 p-2">


              <Button
                variant="outlined"
                startIcon={<CancelOutlinedIcon />}
                className="!border-gray-400 !text-gray-600 hover:!bg-gray-100"
                onClick={() => {
                  setSPlate('');
                  setSRegionCode('');
                  setSVehicleGroupId('');
                  fetchResults(); // โหลดใหม่โดยไม่กรอง
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                className="!bg-primary hover:!bg-primary-dark"
                onClick={() => fetchResults()}
              >
                ค้นหา
              </Button>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Export buttons + result count */}
        {/* <Stack direction="row" spacing={1} sx={{ my: 2 }}>
          <Button variant="outlined" className='!border-gold !text-primary' size="small"
            startIcon={<img src='/icons/txt-file.png' />} onClick={() => handleExport("txt")}>TXT</Button>
          <Button variant="outlined" className='!border-gold !text-primary' size="small"
            startIcon={<img src='/icons/xls-file.png' />} onClick={() => handleExport("xlsx")}>XLS</Button>
          <Button variant="outlined" className='!border-gold !text-primary' size="small"
            startIcon={<img src='/icons/csv-file.png' />} onClick={() => handleExport("csv")}>CSV</Button>
          <Button variant="outlined" className='!border-gold !text-primary' size="small"
            startIcon={<img src='/icons/pdf-file.png' />} onClick={() => handleExport("pdf")}>PDF</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            ผลการค้นหา : {rowCount} รายการ
          </Typography>
        </Stack> */}

        <Stack direction="row" spacing={1} sx={{ my: 2 }}>
          <Button
            variant="outlined"
            className='!border-gold !text-primary'
            size="small"
            startIcon={<img src='/icons/txt-file.png' />}
            onClick={() => openExportPopup("txt")}
          >
            TXT
          </Button>
          <Button
            variant="outlined"
            className='!border-gold !text-primary'
            size="small"
            startIcon={<img src='/icons/xls-file.png' />}
            onClick={() => openExportPopup("xlsx")}
          >
            XLS
          </Button>
          <Button
            variant="outlined"
            className='!border-gold !text-primary'
            size="small"
            startIcon={<img src='/icons/csv-file.png' />}
            onClick={() => openExportPopup("csv")}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            className='!border-gold !text-primary'
            size="small"
            startIcon={<img src='/icons/pdf-file.png' />}
            onClick={() => openExportPopup("pdf")}
          >
            PDF
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            ผลการค้นหา : {rowCount} รายการ
          </Typography>
        </Stack>


        {/* DataTable */}
        <div className="flex-1 flex flex-col">
          <DataTable
            getRowId={(r) => r.id}
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            rowCount={rowCount}
            onPaginationModelChange={handlePaginationChange}
          />
        </div>
      </Box >
      <ImageViewer
        open={viewerOpen}
        imgUrls={viewerImages}
        onClose={() => setViewerOpen(false)}
      />
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>กำหนดจำนวนรายการที่ต้องการส่งออก</DialogTitle>
        <DialogContent>
          <MuiTextField
            label="จำนวนรายการ"
            type="number"
            fullWidth
            value={exportLimit}
            onChange={(e) => setExportLimit(Number(e.target.value))}
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleConfirmExport}
            variant="contained"
            className="!bg-primary hover:!bg-primary-dark"
            disabled={loading}
          >
            {loading ? "กำลังส่งออก..." : "ตกลง"}
          </Button>
        </DialogActions>
      </Dialog>

    </>

  );
};

export default VideoResultPage;
