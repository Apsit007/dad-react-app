// src/pages/Search/SerachVideo.tsx
import { useEffect, useRef, useState } from 'react';
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
  LinearProgress,
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
import dialog from '../../../services/dialog.service';
import Popup from '../../../components/Popup';
import { useNavigate } from 'react-router-dom';
import { LprDataApi } from '../../../services/LprData.service';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { VideoUploadSseService } from '../../../services/VideoUploadSse.service';
import { VideoHistoryApi, type VideoHistoryRecord } from '../../../services/VideoHistory.service';
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility"
import { exportData } from '../../../services/Export.service';




const SerachVideo = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [videoName, setVideoName] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // ===== Search Filter =====
  const [videoNameSearch, setVideoNameSearch] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  // ✅ เก็บ filter ล่าสุด
  const [lastFilter, setLastFilter] = useState<Record<string, any>>({});
  // ===== Table States =====
  const [rows, setRows] = useState<VideoHistoryRecord[]>([]);
  const [rowCount, setRowCount] = useState<number | undefined>(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ========================= SSE =========================
  useEffect(() => {
    const sse = new VideoUploadSseService();

    sse.listen((data) => {
      if (data.event === "upload-progress") {
        if (data.status === "uploading") {
          setUploadProgress(data.percent);
        }
        if (data.status === "completed") {
          setUploadProgress(100);
          dialog.success("✅ อัปโหลดและประมวลผลเสร็จสมบูรณ์!");
          setUploadResult(data.fileInfo);
          setIsUploading(false);

        }
        if (data.status === "failed") {
          dialog.error("❌ การอัปโหลดล้มเหลว: " + data.message);
          setIsUploading(false);
        }
      }
      handleSearch(); // refresh history
    });

    return () => sse.close();
  }, []);

  // ✅ ฟังก์ชันสร้าง filter object (ส่งเฉพาะ key ที่มีค่า)
  const buildVideoFilter = () => {
    const filter: Record<string, any> = {};

    if (videoNameSearch.trim()) filter.title = videoNameSearch.trim() + "*"; // ใช้ wildcard เหมือนระบบอื่น
    if (startDate) filter.start_date = startDate.startOf("day").toISOString();
    if (endDate) filter.end_date = endDate.endOf("day").toISOString();

    return filter;
  };

  // ========================= LOAD HISTORY =========================
  const handleSearch = () => {
    const filter = buildVideoFilter();
    setLastFilter(filter);
    const newPagination = { page: 0, pageSize: paginationModel.pageSize };
    setPaginationModel(newPagination);
    loadHistory(newPagination.page, newPagination.pageSize, filter);
  };

  const loadHistory = async (
    page = paginationModel.page,
    pageSize = paginationModel.pageSize,
    filter: Record<string, any> = lastFilter
  ) => {
    try {
      const res = await VideoHistoryApi.getHistory(
        page + 1, // ✅ backend เริ่มนับจาก 1
        pageSize,
        "id.desc",
        filter
      );

      if (res.success) {
        setRows(res.data);
        setRowCount(res.pagination?.countAll ?? 0);
      } else {
        console.error("⚠️ getHistory failed:", res.message);
      }
    } catch (err) {
      console.error("❌ load history error:", err);
    }
  };


  useEffect(() => {
    loadHistory(0, paginationModel.pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setPaginationModel(model);
    loadHistory(model.page, model.pageSize, lastFilter);
  };
  // ========================= UPLOAD LOGIC =========================
  const onPickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;

    setSelectedVideo(file);
  };

  const handleUpload = async () => {
    if (!selectedVideo) return dialog.warning("โปรดเลือกไฟล์วิดีโอ");
    if (!videoName.trim()) return dialog.warning("กรุณากรอกชื่อวิดีโอ");

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadResult(null);

      await LprDataApi.uploadVideo(selectedVideo, videoName, user.uid!, (p) =>
        setUploadProgress(p)
      );
    } catch (err) {
      dialog.error("เกิดข้อผิดพลาดระหว่างอัปโหลด");
      setIsUploading(false);
    }
  };


  const validateFile = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      dialog.warning('อนุญาตเฉพาะไฟล์วิดีโอเท่านั้น');
      return false;
    }

    if (file.size > 1024 * 1024 * 1024) {
      // ✅ จำกัดขนาด 1GB (1024MB)
      dialog.warning('ขนาดไฟล์ต้องไม่เกิน 1GB');
      return false;
    }

    return true;
  };



  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setVideoNameSearch("");

    const clearedFilter = {};
    setLastFilter(clearedFilter);

    const newPagination = { page: 0, pageSize: paginationModel.pageSize };
    setPaginationModel(newPagination);
    loadHistory(newPagination.page, newPagination.pageSize, clearedFilter);
  };


  // ========================= COLUMNS =========================
  const columns: GridColDef[] = [
    {
      field: "rownumb",
      headerName: "ลำดับ",
      width: 80,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
        const pagination = params.api.state.pagination.paginationModel;
        return <span>{pagination.page * pagination.pageSize + rowIndex + 1}</span>;
      },
    },
    {
      field: "title",
      headerName: "ชื่อวิดีโอ",
      flex: 1.2,
      minWidth: 180,
      headerAlign: "center",
    },
    {
      field: "upload_start",
      headerName: "เวลาเริ่มอัปโหลด",
      flex: 1,
      minWidth: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className='flex w-full h-full justify-center items-center'>
          <Typography variant="body2">
            {params.value ? dayjs(params.value).format("DD/MM/YYYY HH:mm:ss") : "-"}
          </Typography>
        </div>
      ),
    },
    {
      field: "process_complete",
      headerName: "เวลาประมวลผลเสร็จ",
      flex: 1,
      minWidth: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className='flex w-full h-full justify-center items-center'>

          <Typography variant="body2">
            {params.value ? dayjs(params.value).format("DD/MM/YYYY HH:mm:ss") : "-"}
          </Typography>
        </div>
      ),
    },
    {
      field: "file_size_mb",
      headerName: "ขนาด (MB)",
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className='flex w-full h-full justify-center items-center'>

          <Typography variant="body2">{params.value?.toFixed(2) ?? "-"}</Typography>
        </div>
      ),
    },
    {
      field: "vdo_duration_seconds",
      headerName: "ความยาว (วินาที)",
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "uploader_fullname",
      headerName: "ผู้ Upload",
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "status",
      headerName: "สถานะ",
      flex: 0.8,
      minWidth: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const color =
          params.value === "completed"
            ? "green"
            : params.value === "uploaded"
              ? "orange"
              : params.value === "failed"
                ? "red"
                : "gray";
        return (
          <div className='flex w-full h-full justify-center items-center'>
            <Typography sx={{ color, fontWeight: "bold" }}>
              {params.value || "-"}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.8,
      minWidth: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        // แสดงปุ่มเฉพาะสถานะ uploaded เท่านั้น
        if (params.row.status === "uploaded") {
          return (
            <div className="flex w-full h-full justify-center items-center">
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayCircleOutlineIcon />}
                className="!bg-primary hover:!bg-primary-dark !text-white"
                onClick={async () => {
                  try {
                    const confirm = await dialog.confirm(
                      `ต้องการถอดภาพจากวิดีโอ "${params.row.title}" ใช่หรือไม่?`
                    );
                    if (!confirm) return;

                    dialog.loading("กำลังเริ่มถอดภาพ...");
                    const res = await LprDataApi.processVideo(params.row.file_path);

                    if (res.success) {
                      dialog.success("✅ เริ่มถอดภาพสำเร็จแล้ว!");
                      handleSearch(); // reload table
                    } else {
                      dialog.warning(res.message || "ไม่สามารถเริ่มถอดภาพได้");
                    }
                  } catch (err) {
                    console.error("❌ process video error:", err);
                    dialog.error("เกิดข้อผิดพลาดระหว่างการถอดภาพ");
                  } finally {
                    dialog.close();
                  }
                }}
              >
                ถอดภาพ
              </Button>
            </div>
          );
        }
        else if (params.row.status === "completed") {
          return (
            <div className="flex w-full h-full justify-center items-center">
              <Button
                variant="contained"
                size="small"
                startIcon={<VisibilityIcon />}
                className="!bg-primary hover:!bg-primary-dark !text-white"
                onClick={() => {
                  navigate("/search/video/videoresult", {
                    state: {
                      video_id: params.row.id
                    },
                  });
                }}
              >
                ดูผลลัพธ์
              </Button>
            </div>)
        }

        // ถ้าไม่ใช่ uploaded แสดงข้อความ -
        return (
          <div className="flex w-full h-full justify-center items-center">
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          </div>
        );
      },
    },

  ];

  // ✅ ฟังก์ชันเตรียมข้อมูลก่อน export
  const prepareExportRows = (rows: VideoHistoryRecord[]) => {
    return rows.map((r, i) => ({
      ลำดับ: i + 1,
      "ชื่อวิดีโอ": r.title ?? "-",
      "ขนาดไฟล์ (MB)": r.file_size_mb ? r.file_size_mb.toFixed(2) : "-",
      "ความยาว (วินาที)": r.vdo_duration_seconds ?? "-",
      "ผู้ Upload": r.uploader_fullname ?? "-",
      "สถานะ":
        r.status === "completed"
          ? "เสร็จสมบูรณ์"
          : r.status === "uploaded"
            ? "กำลังประมวลผล"
            : r.status === "failed"
              ? "ล้มเหลว"
              : "-",
      "เวลาเริ่มอัปโหลด": r.upload_start
        ? dayjs(r.upload_start).format("DD/MM/YYYY HH:mm:ss")
        : "-",
      "เวลาประมวลผลเสร็จ": r.process_complete
        ? dayjs(r.process_complete).format("DD/MM/YYYY HH:mm:ss")
        : "-",
    }));
  };




  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark !mt-[5px]'>
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
                <Typography variant='caption' color='text.secondary'>รองรับไฟล์ MP4</Typography>
                <Typography variant='caption' color='text.secondary'>MPEG,AVI,WMV</Typography>
                {selectedVideo && (
                  <Typography variant='caption' sx={{ mt: 1 }} color='text.secondary'>
                    {selectedVideo.name}
                  </Typography>
                )}
              </Box>
            </div>

            {/* Search Fields */}
            <div className="w-full md:w-5/6 p-2 relative">
              <div className="flex flex-wrap -m-2">
                <div className="w-full sm:w-1/3 p-2">
                  <Typography variant='caption'>ชื่อวิดีโอ</Typography>
                  <TextField placeholder='ชื่อวิดีโอ' fullWidth value={videoNameSearch} onChange={(e) => setVideoNameSearch(e.target.value)} />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <Typography variant='caption'>วันที่เริ่มต้น</Typography>
                  <DatePicker value={startDate} onChange={setStartDate} maxDate={endDate ?? undefined} />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <Typography variant='caption'>วันที่สิ้นสุด</Typography>
                  <DatePicker value={endDate} onChange={setEndDate} minDate={startDate ?? undefined} />
                </div>
              </div>
              <div className="w-full flex justify-end bottom-0 absolute  p-2 items-end gap-2">
                <Button
                  variant="outlined"
                  startIcon={<CancelOutlinedIcon />}
                  className="!border-gray-400 !text-gray-600 hover:!bg-gray-100"
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  className="!bg-primary hover:!bg-primary-dark"
                  onClick={() => handleSearch()}
                >
                  ค้นหา
                </Button>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/txt-file.png' />}
          onClick={() => exportData(prepareExportRows(rows), "txt", "upload video")}>TXT</Button>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/xls-file.png' />}
          onClick={() => exportData(prepareExportRows(rows), "xlsx", "upload video")}>XLS</Button>
        <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/csv-file.png' />}
          onClick={() => exportData(prepareExportRows(rows), "csv", "upload video")}>CSV</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>
          ผลการค้นหา : {rowCount} รายการ
        </Typography>
      </Stack>

      <div className="flex-1 flex flex-col ">
        <DataTable
          getRowId={(r) => r.id}
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          rowCount={rowCount}
          onPaginationModelChange={handlePaginationChange}
        />
      </div>

      <Popup title="อัพไฟล์วิดีโอ" show={showUploadPopup} onClose={() => setShowUploadPopup(false)}>
        <Box sx={{ minWidth: 420 }}>
          <div className="flex flex-col gap-5">
            {/* ชื่อไฟล์ */}
            <div>
              <Typography variant='body2' className='!text-primary !mb-3'>อัพโหลดวิดีโอ</Typography>
              <div className='w-1/3 flex gap-2'>
                <TextField
                  fullWidth
                  value={selectedVideo?.name || ''}
                  placeholder='ยังไม่ได้เลือกไฟล์'
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant='contained'
                  className='!bg-primary hover:!bg-primary-dark'
                  onClick={onPickFile}
                  startIcon={<ArrowForwardIosRoundedIcon fontSize='small' />}
                  disabled={isUploading} // 🔒 ระหว่างอัปโหลดเลือกไฟล์ไม่ได้
                >
                  เลือก
                </Button>
              </div>
            </div>

            {/* ชื่อวิดีโอ */}
            <div>
              <Typography variant='body2' className='!text-primary !mb-3'>ชื่อวิดีโอ</Typography>
              <TextField
                placeholder='ชื่อวิดีโอ'
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                disabled={isUploading}
              />
            </div>

            {/* แถบสถานะอัปโหลด */}
            {isUploading && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="caption">กำลังอัปโหลด... {uploadProgress}%</Typography>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
              </Box>
            )}

            {/* แสดงผลเมื่ออัปโหลดเสร็จ */}
            {uploadResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="primary">
                  ✅ อัปโหลดสำเร็จ:{" "}
                  <a href={uploadResult.url} target="_blank" rel="noreferrer">
                    {uploadResult.originalName}
                  </a>
                </Typography>
              </Box>
            )}

            {/* ปุ่มด้านล่าง */}
            <div className="flex justify-end gap-2 pt-2">
              {/* 🔸 ก่อนเริ่มอัปโหลด */}
              {!isUploading && !uploadResult && (
                <>
                  <Button
                    variant="outlined"
                    className="!border-primary !text-primary"
                    onClick={() => setShowUploadPopup(false)}
                    startIcon={<CloseOutlinedIcon />}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="contained"
                    className="!bg-primary hover:!bg-primary-dark"
                    onClick={handleUpload}
                    startIcon={<FileUploadOutlinedIcon />}
                  >
                    อัพโหลด
                  </Button>
                </>
              )}

              {/* 🔸 ระหว่างอัปโหลด (0–99%) */}
              {isUploading && uploadProgress < 100 && (
                <Button
                  variant="outlined"
                  className="!border-gray-400 !text-gray-600 hover:!bg-gray-100"
                  startIcon={<CancelOutlinedIcon />}
                  onClick={() => dialog.warning("ไม่สามารถยกเลิกการอัปโหลดได้ขณะนี้")}
                >
                  ยกเลิก
                </Button>
              )}

              {/* 🔸 หลังอัปโหลดครบ 100% หรือมีผลลัพธ์ */}
              {(uploadProgress >= 100 || uploadResult) && (
                <Button
                  variant="contained"
                  className="!bg-primary hover:!bg-primary-dark"
                  onClick={() => {
                    setShowUploadPopup(false);
                    setIsUploading(false);
                    setUploadProgress(0);
                    setSelectedVideo(null);
                    setVideoName("");
                    handleSearch(); // ✅ รีเฟรชตาราง
                  }}
                >
                  ปิด
                </Button>
              )}
            </div>

          </div>
        </Box>
      </Popup>


    </Box>
  );
};

export default SerachVideo;
