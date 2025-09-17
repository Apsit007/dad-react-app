import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputLabel,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DepartmentApi, type Department } from "../../services/Department.service";
import DataTable from "../../components/DataTable";
import dialog from "../../services/dialog.service";

// Mock API (คุณจะต้องไปเชื่อม service จริง)



export default function DepartmentPage() {
    const [rows, setRows] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editRow, setEditRow] = useState<Department | null>(null);

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0, // DataGrid ใช้ 0-based
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);

    const [form, setForm] = useState({
        dep_name: "",
        location: "",
        floor: "",
        notes: "",
        active: true,   // ✅ ค่า default
        visible: true,  // ✅ ค่า default
    });

    // โหลดข้อมูลจาก API
    useEffect(() => {
        loadDepartments();
    }, [paginationModel]);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const res = await DepartmentApi.list(
                paginationModel.page + 1, // ✅ API ใช้ 1-based
                paginationModel.pageSize
            );
            setRows(res.data);
            setRowCount(res.pagination?.countAll || 0); // ✅ สมมติ API ส่ง count กลับมา
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const payload = {
            ...form,
            active: true,
            visible: true,
        };

        if (editRow && editRow.uid) {
            await DepartmentApi.update(editRow.uid, payload);
        } else {
            await DepartmentApi.create(payload);
        }

        setOpen(false);
        setEditRow(null);
        setForm({ dep_name: "", location: "", floor: "", notes: "", active: true, visible: true });
        loadDepartments();
    };

    const handleDelete = async (uid: string) => {
        const confirmed = await dialog.confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?');
        if (!confirmed) return;
        await DepartmentApi.remove(uid);
        loadDepartments();
    };



    const columns: GridColDef[] = [
        { field: "dep_name", headerName: "ชื่อหน่วยงาน", headerAlign: 'center', flex: 1 },
        { field: "location", headerName: "ที่อยู่", headerAlign: 'center', flex: 1 },
        { field: "floor", headerName: "ชั้น", headerAlign: 'center', flex: 0.5 },
        { field: "notes", headerName: "หมายเหตุ", headerAlign: 'center', flex: 1 },
        {
            field: "actions",
            headerName: "การจัดการ",
            headerAlign: 'center',
            sortable: false,
            flex: 0.5,
            renderCell: (params) => (
                <>
                    <IconButton
                        color="primary"
                        onClick={() => {
                            setEditRow(params.row);
                            setForm(params.row);
                            setOpen(true);
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDelete(params.row.uid)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
                จัดการข้อมูลหน่วยงาน
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
                onClick={() => {
                    setEditRow(null);
                    setForm({ dep_name: "", location: "", floor: "", notes: "", active: true, visible: true });
                    setOpen(true);
                }}
            >
                เพิ่ม Department
            </Button>

            <DataTable
                rows={rows}
                getRowId={(row) => row.uid}
                columns={columns}
                loading={loading}
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                paginationMode="server"
            />

            {/* Popup Form */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editRow ? "แก้ไข Department" : "เพิ่ม Department"}
                </DialogTitle>
                <DialogContent dividers>
                    <div className="flex w-full flex-col gap-2">

                        <div>
                            <InputLabel shrink required>ชื่อหน่วยงาน</InputLabel>
                            <TextField
                                fullWidth
                                margin="dense"
                                value={form.dep_name}
                                onChange={(e) => setForm({ ...form, dep_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel shrink required>ที่อยู่</InputLabel>
                            <TextField
                                fullWidth
                                margin="dense"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel shrink required>ชั้น</InputLabel>
                            <TextField
                                fullWidth
                                margin="dense"
                                value={form.floor}
                                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel shrink required>หมายเหตุ</InputLabel>
                            <TextField

                                fullWidth
                                margin="dense"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ยกเลิก</Button>
                    <Button variant="contained" onClick={handleSave}>
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
