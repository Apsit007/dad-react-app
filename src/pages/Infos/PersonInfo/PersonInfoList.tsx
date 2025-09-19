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
import { useEffect, useState } from 'react';
import { MemberApi, type Member } from '../../../services/Member.service';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DepartmentApi, type Department } from '../../../services/Department.service';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import dialog from '../../../services/dialog.service';


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
    }, [])

    const loadData = async (page = 1, limit = 10) => {
        try {
            const filter: any = {
                firstname,
                lastname,
                member_status: status || undefined,
                dep_uid: dep || undefined,
                member_group_id: memberGroupId || undefined,
                created_at_start: createdStart ? dayjs(createdStart).format("YYYY-MM-DD") : undefined,
                created_at_end: createdEnd ? dayjs(createdEnd).format("YYYY-MM-DD") : undefined,
            };

            const res = await MemberApi.list(page, limit, "uid.asc", filter);
            if (res.success) {
                setRows(res.data || []);
                setRowCount(res.pagination?.countAll || 0);
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
            field: 'actions', headerName: '', width: 100, sortable: false, align: 'center',
            renderCell: (params) => (
                <div className='flex w-full h-full items-center justify-center gap-1'>
                    <IconButton size="small" component={NavLink} to={`/info/person/form/${params.row.uid}`}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(params.row.uid)} disabled={params.row.member_status === 'active'}><DeleteIcon fontSize="small" /></IconButton>
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

        // ✅ ถ้า member_status = terminate
        if (row.member_status === "terminated") {
            return "terminated-row";
        }

        // ✅ ถ้า member_status = expired
        if (row.member_status === "expired") {
            return "expired-row";
        }

        // ✅ ถ้า end_date <= 7 วันจากวันนี้
        if (row.end_date) {
            const endDate = dayjs(row.end_date);
            const now = dayjs();
            if (endDate.diff(now, "day") <= 7 && endDate.isAfter(now)) {
                return "expirewarning-row";
            }
        }

        return "";
    };
    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
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
                                            {g.name_th}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (เริ่มต้น)</InputLabel>
                                <DatePicker value={createdStart} onChange={(val) => setCreatedStart(val)} />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 p-2">
                                <InputLabel shrink>วันที่สร้างข้อมูล (สิ้นสุด)</InputLabel>
                                <DatePicker value={createdEnd} onChange={(val) => setCreatedEnd(val)} />
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
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/txt-file.png' />}>TXT</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/xls-file.png' />}>XLS</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/csv-file.png' />}>CSV</Button>
                <Button variant="outlined" className='!border-gold !text-primary' size="small" startIcon={<img src='/icons/pdf-file.png' />}>PDF</Button>
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
    );
};

export default PersonInfoList;

