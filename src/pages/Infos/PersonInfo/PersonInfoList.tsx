// src/pages/PersonInfo/PersonInfoList.tsx
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Select, MenuItem, Button, Box, Avatar, Stack, InputLabel, IconButton, Autocomplete } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DataTable from '../../../components/DataTable';
import { type GridColDef, type GridPaginationModel, type GridRowClassNameParams } from '@mui/x-data-grid';
import { useNavigate, NavLink } from 'react-router-dom';
import ChipTag from '../../../components/ChipTag';
import { useSelector } from 'react-redux';
import { selectMemberGroups } from '../../../store/slices/masterdataSlice';
import { useCallback, useEffect, useState } from 'react';
import { MemberApi, type Member } from '../../../services/Member.service';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DepartmentApi, type Department } from '../../../services/Department.service';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dialog from '../../../services/dialog.service';
import Popup from '../../../components/Popup';
import ManageSearchIcon from "@mui/icons-material/ManageSearch"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { exportData } from '../../../services/Export.service';
import ImageViewer from '../../../components/ImageViewer';
import ImageTag from '../../../components/ImageTag';


const memberStatusList = [
    { id: 1, status: 'terminated' },
    { id: 2, status: 'expired' },
    { id: 4, status: 'active' },
]


const PersonInfoList = () => {
    const navigate = useNavigate();
    const memberGroups = useSelector(selectMemberGroups);

    // ✅ State
    const [rows, setRows] = useState<Member[]>([]);
    const [historyRows, setHistoryRows] = useState<Member[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10
    });

    // ✅ Search Filters
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [status, setStatus] = useState("");
    const [dep, setDep] = useState<string | null | undefined>(null);

    const [memberGroupId, setMemberGroupId] = useState<number | "">("");
    const [createdStart, setCreatedStart] = useState<Dayjs | null>(null);
    const [createdEnd, setCreatedEnd] = useState<Dayjs | null>(null);

    const [departmentList, setDepartmentList] = useState<Department[]>([])

    //popup 
    const [historyPopupOpen, setHistoryPopupOpen] = useState(false);

    const [openImageViewer, setOpenImageViewer] = useState(false);
    const [viewImgUrl, setViewImgUrl] = useState<string>('')

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const res = await DepartmentApi.list(
                    1, 1000
                );
                setDepartmentList(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        loadDepartments();
        loadData();
    }, [])

    const loadData = async (page = 1, limit = 10) => {
        try {
            const res = await MemberApi.search(page, limit, "id", false, {
                firstname: firstname ? `${firstname}*` : undefined,
                lastname: lastname ? `${lastname}*` : undefined,
                dep_uid: dep || undefined,
                member_group_id: memberGroupId || undefined,
                start_date: createdStart ? dayjs(createdStart).startOf("day").format('YYYY-MM-DD HH:mm:ss') : undefined,
                end_date: createdEnd ? dayjs(createdEnd).endOf("day").format('YYYY-MM-DD HH:mm:ss') : undefined,
                member_status: status || undefined,
            });

            if (res.success) {
                setRows(res.data || []);
                setRowCount(res.pagination?.countAll || 0);
            } else {
                setRows([]);
                setRowCount(0);
            }
        } catch (err) {
            console.error("❌ Load members error:", err);
        }
    };



    const handleDelete = async (uid: string) => {
        const confirm = await dialog.confirm("ต้องการจะลบข้อมูลใช่หรือไม่");

        if (confirm) {
            try {
                const res = await MemberApi.delete(uid);
                if (res.success) {
                    dialog.success("ลบสำเร็จ");
                    // 👉 โหลดข้อมูลใหม่
                    loadData(paginationModel.page + 1, paginationModel.pageSize);
                } else {
                    dialog.error("ผิดพลาด");
                }
            } catch (err) {
                console.error("❌ Delete error:", err);
            }
        }
    };

    // 👉 กดค้นหา
    const handleSearch = () => {
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); // reset page = 0
        loadData(1, paginationModel.pageSize);
    };

    // 👉 เปลี่ยนหน้า pagination
    const handlePageChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
        loadData(model.page + 1, model.pageSize);
    };

    // 👉 เคลียร์ค่า filter
    const handleClear = () => {
        setFirstname("");
        setLastname("");
        setStatus("");
        setDep(null);
        setMemberGroupId("");
        setCreatedStart(null);
        setCreatedEnd(null);
        setRows([]);
        setRowCount(0);
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    };

    // --- Table Columns Definition ---
    const columns: GridColDef[] = [
        {
            field: "actions",
            headerName: "",
            width: 100,
            sortable: false,
            align: "center",
            renderCell: (params) => (
                <div className="flex w-full h-full items-center justify-center gap-1">
                    <IconButton
                        size="small"
                        component={NavLink}
                        to={`/info/person/form/${params.row.uid}`}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={() => handleDelete(params.row.uid)}
                        disabled={params.row.member_status != "terminated"}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={() => onOpenHistory(params.row.idcard)}
                    >
                        <ManageSearchIcon fontWeight="small" />
                    </IconButton>
                </div>
            ),
        },
        {
            field: "rownumb",
            headerName: "ลำดับ",
            width: 80,
            align: "center",
            headerAlign: "center",
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
                const pagination = params.api.state.pagination.paginationModel;
                return (
                    <span>
                        {pagination.page * pagination.pageSize + rowIndex + 1}
                    </span>
                );
            },
        },
        {
            field: "card_number",
            headerName: "Card Number (Hex)",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderCell: (params) =>
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>{params.value || "-"}</Typography>
                </div>
        },
        {
            field: "card_code",
            headerName: "Card Code",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (

                <div className="w-full h-full flex justify-center items-center">
                    <Typography>{params.value || "-"}</Typography>
                </div>
            )
        },
        {
            field: "image_url",
            headerName: "ภาพใบหน้า",
            flex: 1,
            minWidth: 120,
            headerAlign: "center",
            align: "center",
            sortable: false,
            renderCell: (params) => (
                <div className="flex w-full justify-center gap-2 h-full p-[1px]">
                    <ImageTag
                        tag={params.row.member_group_name_en ?? null}
                        img={params.row.image_url ?? ""}
                    />
                </div>
            ),
        },
        {
            field: "fullname",
            headerName: "ชื่อ-นามสกุล",
            flex: 1.5,
            minWidth: 200,
            headerAlign: "center",
            renderCell: (params) => {
                const firstname = params.row.firstname ?? "";
                const lastname = params.row.lastname ?? "";
                const fullname = `${firstname} ${lastname}`.trim();
                return (<div className="w-full h-full flex justify-center items-center">
                    <Typography>{fullname || "-"}</Typography>
                </div>)
            },
        },
        {
            field: "idcard",
            headerName: "เลขบัตรประชาชน",
            flex: 1.5,
            minWidth: 200,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (<div className="w-full h-full flex justify-center items-center"><Typography>{params.value || "-"}</Typography></div>),
        },
        {
            field: "dep_name",
            headerName: "หน่วยงาน",
            flex: 1.5,
            minWidth: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) =>
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>{params.value || "-"}</Typography>
                </div>
        },
        {
            field: "member_status",
            headerName: "สถานะ",
            flex: 1.5,
            minWidth: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) =>
            (<div className="w-full h-full flex justify-center items-center">
                <Typography>{params.value || "-"}</Typography>
            </div>)
        },
        {
            field: "created_at",
            headerName: "วันที่สร้าง",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>
                        {params.value
                            ? dayjs(params.value).format("DD/MM/YYYY")
                            : "-"}
                    </Typography>
                </div>
            ),
        },
        {
            field: "end_date",
            headerName: "วันที่สิ้นสุด",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <Typography>
                        {params.value
                            ? dayjs(params.value).format("DD/MM/YYYY")
                            : "-"}
                    </Typography>
                </div>
            ),
        },
        {
            field: "member_group_name_en",
            headerName: "ประเภทบุคคล",
            flex: 1,
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className="w-full h-full flex justify-center items-center">
                    <ChipTag tag={params.value || "-"} />
                </div>
            ),
        },
    ];


    const historycolumns: GridColDef[] = [
        {
            field: 'actions', headerName: '', width: 100, sortable: false, align: 'center',
            renderCell: (params) => (
                <div className='flex w-full h-full items-center justify-center gap-1'>
                    <IconButton size="small" component={NavLink} to={`/info/person/form/${params.row.uid}`}>
                        <VisibilityOutlinedIcon fontWeight="small" />
                    </IconButton>

                </div>
            )
        },
        {
            field: 'rownumb',
            headerName: 'ลำดับ',
            width: 80,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
                const pagination = params.api.state.pagination.paginationModel;
                return (
                    <span>
                        {pagination.page * pagination.pageSize + rowIndex + 1}
                    </span>
                );
            },
        },
        { field: 'card_number', headerName: 'Card Number (Hex)', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
        { field: 'card_code', headerName: 'Card Code', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center' },
        {
            field: 'image_url', headerName: 'ภาพใบหน้า', flex: 1, minWidth: 120, headerAlign: 'center', align: 'center', sortable: false,
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <Avatar variant='square' src={params.value} className=' !h-[70%] !w-[70%]' />
                </div>
            )
        },
        {
            field: 'fullname', headerName: 'ชื่อ-นามสกุล', flex: 1.5, minWidth: 200, headerAlign: 'center',
            renderCell: (params) => `${params.row.firstname || ''} ${params.row.lastname || ''}`
        },
        { field: 'idcard', headerName: 'เลขบัตรประชาชน', flex: 1.5, minWidth: 200, headerAlign: 'center' },
        { field: 'dep_name', headerName: 'หน่วยงาน', flex: 1.5, minWidth: 250, headerAlign: 'center' },
        { field: 'member_status', headerName: 'สถานะ', flex: 1.5, minWidth: 250, headerAlign: 'center' },
        {
            field: 'created_at',
            headerName: 'วันที่สร้าง',
            flex: 1,
            minWidth: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) =>
                params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""
        },
        {
            field: 'end_date',
            headerName: 'วันที่สิ้นสุด',
            flex: 1,
            minWidth: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) =>
                params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""
        },
        {
            field: 'member_group_name_en', headerName: 'ประเภทบุคคล', flex: 1, minWidth: 150, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <div className='w-full h-full flex justify-center items-center'>
                    <ChipTag tag={params.value} />
                </div>
            )
        },

    ];

    const getRowClassName = (params: GridRowClassNameParams) => {
        const row = params.row;

        // ✅ ใช้ member_status เป็นหลัก
        if (row.member_status === "terminated") {
            return "terminated-row";
        }

        if (row.member_status === "expired") {
            return "expired-row";
        }
        if (row.member_status === "expiring") {
            return "expirewarning-row";
        }



        return "";
    };

    const onOpenHistory = async (idcard: string) => {
        try {
            const res = await MemberApi.getByIdCard(idcard)
            if (res.success) {
                setHistoryRows(res.data || []);

            } else {
                setHistoryRows([]);
            }
            setHistoryPopupOpen(true);
        } catch (err) {
            console.error("❌ Load members error:", err);
        }
    }

    const handleClosehistoryPopup = () => {
        setHistoryPopupOpen(false);
        setHistoryRows([]);
    }

    const viewImg = useCallback((img: string) => {
        setOpenImageViewer(true);
        setViewImgUrl(img)
    }, [viewImgUrl])

    // ✅ ฟังก์ชันเตรียมข้อมูลก่อน export
    const prepareExportRows = (rows: Member[]) => {
        return rows.map((r, i) => ({
            ลำดับ: i + 1,
            "Card Number (Hex)": r.card_number ?? "-",
            "Card Code": r.card_code ?? "-",
            "ชื่อ-นามสกุล": `${r.firstname ?? ""} ${r.lastname ?? ""}`.trim() || "-",
            "เลขบัตรประชาชน": r.idcard ?? "-",
            "หน่วยงาน": r.dep_name ?? "-",
            "สถานะ": r.member_status ?? "-",
            "วันที่สร้าง": r.created_at
                ? dayjs(r.created_at).format("DD/MM/YYYY")
                : "-",
            "วันที่สิ้นสุด": r.end_date
                ? dayjs(r.end_date).format("DD/MM/YYYY")
                : "-",
            "ประเภทบุคคล": r.member_group_name_en ?? "-",
        }));
    };

    return (
        <>
            <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark !mt-[5px]'>
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
                                    <TextField value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="ชื่อ" />
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>นามสกุล</InputLabel>
                                    <TextField value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="นามสกุล" />
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>หน่วยงาน</InputLabel>
                                    <Autocomplete
                                        options={departmentList}
                                        getOptionLabel={(option) => option.dep_name}
                                        value={departmentList.find((d) => d.uid === dep) || null}
                                        onChange={(_, newValue) => setDep(newValue ? newValue.uid : null)}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="เลือกหน่วยงาน" />
                                        )}
                                    />
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>ประเภทบุคคล</InputLabel>
                                    <Select value={memberGroupId} onChange={(e) => setMemberGroupId(Number(e.target.value))}>
                                        <MenuItem value="">
                                            <em>ทุกประเภท</em>
                                        </MenuItem>
                                        {memberGroups.map((g) => (
                                            <MenuItem key={g.id} value={g.id}>
                                                {g.name_th}  ({g.name_en})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>วันที่สร้างข้อมูล (เริ่มต้น)</InputLabel>
                                    <DatePicker value={createdStart} onChange={(val) => setCreatedStart(val)} maxDate={createdEnd ?? undefined} />
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>วันที่สร้างข้อมูล (สิ้นสุด)</InputLabel>
                                    <DatePicker value={createdEnd} onChange={(val) => setCreatedEnd(val)} minDate={createdStart ?? undefined} />
                                </div>
                                <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                    <InputLabel shrink>สถานะ</InputLabel>
                                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <MenuItem value="">
                                            <em>ทุกสถานะ</em>
                                        </MenuItem>
                                        {memberStatusList.map((g) => (
                                            <MenuItem key={g.id} value={g.status}>
                                                {g.status}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div className="w-full flex justify-end p-2 gap-2">
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelOutlinedIcon />}
                                    className="!border-gray-400 !text-gray-600 hover:!bg-gray-100"
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                                <Button variant="contained" startIcon={<SearchIcon />} className='!bg-primary hover:!bg-primary-dark' onClick={handleSearch}>
                                    ค้นหา
                                </Button>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>

                <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate('/info/person/form')} className='!bg-gold hover:!bg-gold-dark'>บุคคล</Button>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/txt-file.png" />}
                        onClick={() => exportData(prepareExportRows(rows), "txt", "member_list")}
                    >
                        TXT
                    </Button>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/xls-file.png" />}
                        onClick={() => exportData(prepareExportRows(rows), "xlsx", "member_list")}
                    >
                        XLS
                    </Button>
                    <Button
                        variant="outlined"
                        className="!border-gold !text-primary"
                        size="small"
                        startIcon={<img src="/icons/csv-file.png" />}
                        onClick={() => exportData(prepareExportRows(rows), "csv", "member_list")}
                    >
                        CSV
                    </Button>
                    <Button
                        variant="outlined"
                        className='!border-gold !text-primary'
                        size="small"
                        startIcon={<img src='/icons/pdf-file.png' />}
                        onClick={() => {
                            // 👉 process rows ก่อน export
                            const processedRows = rows.map((r, i) => ({
                                ...r,
                                fullname: `${r.firstname || ""} ${r.lastname || ""}`,
                                end_date: r.end_date ? dayjs(r.end_date).format("DD/MM/YYYY") : "",
                                created_at: r.created_at ? dayjs(r.created_at).format("DD/MM/YYYY") : "",
                            }));

                            exportData(processedRows, "pdf", "member_list", columns);
                        }}
                    >
                        PDF
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" sx={{ alignSelf: 'center' }}>ผลการค้นหา : {rowCount} รายการ</Typography>
                </Stack>

                <DataTable
                    rows={rows}
                    columns={columns}
                    paginationModel={paginationModel}
                    rowCount={rowCount}
                    onPaginationModelChange={handlePageChange}
                    getRowId={(row) => row.uid}
                    getRowClassName={getRowClassName}
                />
            </Box>

            <Popup
                title="ประวัติผู้ใช้งาน"
                show={historyPopupOpen}
                onClose={handleClosehistoryPopup}
            >
                <Box sx={{ height: 400, width: '100%', marginTop: 3 }}>
                    <DataTable
                        getRowId={(row) => row.uid}
                        columns={historycolumns}
                        rows={historyRows}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        rowCount={rowCount}
                    />
                </Box>
            </Popup>
            <ImageViewer
                open={openImageViewer}
                imgUrl={viewImgUrl}
                onClose={() => setOpenImageViewer(false)}
            />
        </>
    );
};

export default PersonInfoList;

