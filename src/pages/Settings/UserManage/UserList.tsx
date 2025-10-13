// src/pages/Settings/UserManage/UserList.tsx
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  IconButton,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../../components/DataTable';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ChipTag from '../../../components/ChipTag';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserApi, type User, type UserListFilter } from '../../../services/User.service';
import dialog from '../../../services/dialog.service';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { DepartmentApi, type Department } from '../../../services/Department.service';

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Approved', value: 'approved' },
  { label: 'Inactive', value: 'inactive' },
];

const mapStatusToChipTag = (status?: string): 'Active' | 'InActive' | null => {
  if (!status) return null;
  const normalized = status.toLowerCase();

  if (['active', 'approved', 'success'].includes(normalized)) {
    return 'Active';
  }

  if (['inactive', 'disabled', 'terminated'].includes(normalized)) {
    return 'InActive';
  }

  return null;
};

const formatFullName = ({ title, firstname, lastname }: Pick<User, 'title' | 'firstname' | 'lastname'>) => {
  const parts = [title, firstname, lastname].filter(Boolean);
  return parts.join(' ').trim();
};

const buildFilter = (filters: {
  firstname: string;
  lastname: string;
  organization: string | null | undefined;
  status: string;
}): UserListFilter => {
  const nextFilter: UserListFilter = {};

  if (filters.firstname.trim()) {
    nextFilter.firstname = filters.firstname.trim();
  }

  if (filters.lastname.trim()) {
    nextFilter.lastname = filters.lastname.trim();
  }

  if (filters.organization) {
    nextFilter.organization = filters.organization;
  }

  if (filters.status) {
    nextFilter.user_status = filters.status;
  }

  return nextFilter;
};

const UserListPage = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState<User[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [refreshKey, setRefreshKey] = useState(0);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [organization, setOrganization] = useState<string | null | undefined>(null);
  const [status, setStatus] = useState('');
  const [appliedFilter, setAppliedFilter] = useState<UserListFilter>({});
  const [organizationOptions, setOrganizationOptions] = useState<string[]>([]);

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

  useEffect(() => {
    let active = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await UserApi.list({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          filter: appliedFilter,
        });

        if (!active) return;

        if (res.success) {
          const data = res.data ?? [];
          setRows(data);
          setRowCount(res.pagination?.countAll ?? data.length ?? 0);

          setOrganizationOptions((prev) => {
            const next = new Set(prev);
            data
              .map((item) => item.organization)
              .filter((value): value is string => Boolean(value))
              .forEach((value) => next.add(value));
            return Array.from(next).sort((a, b) => a.localeCompare(b));
          });
        } else {
          setRows([]);
          setRowCount(0);
        }
      } catch (err) {
        console.error('Load users error:', err);
        if (active) {
          setRows([]);
          setRowCount(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      active = false;
    };
  }, [paginationModel.page, paginationModel.pageSize, appliedFilter, refreshKey]);

  const handleSearch = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setAppliedFilter(
      buildFilter({
        firstname,
        lastname,
        organization,
        status,
      })
    );
  };

  const handleClear = () => {
    setFirstname('');
    setLastname('');
    setOrganization('');
    setStatus('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setAppliedFilter({});
  };

  const handleDelete = useCallback(
    async (uid: string) => {
      const confirmed = await dialog.confirm('Delete this user?');
      if (!confirmed) return;

      try {
        const res = await UserApi.remove(uid);
        if (res.success) {
          dialog.success('User deleted');
          setRefreshKey((prev) => prev + 1);
        } else {
          dialog.error(res.message || 'Unable to delete user');
        }
      } catch (err) {
        console.error('Remove user error:', err);
        dialog.error('Failed to delete user');
      }
    },
    []
  );

  const columns: GridColDef<User>[] = useMemo(
    () => [
      {
        field: 'rownumber',
        headerName: 'ลำดับ',
        width: 90,
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        renderCell: (params) => {
          const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
          const pagination = params.api.state.pagination.paginationModel;
          return <span>{pagination.page * pagination.pageSize + rowIndex + 1}</span>;
        },
      },
      {
        field: 'fullname',
        headerName: 'ชื่อ-นามสกุล',
        flex: 1.4,
        minWidth: 220,
        headerAlign: 'center',
        renderCell: (params) => {
          // ✅ ป้องกัน null/undefined จากฟังก์ชัน formatFullName
          const fullName = formatFullName?.(params.row) || '-';
          return (
            <div className="flex justify-center items-center h-full">
              <Typography variant="body2">{fullName}</Typography>
            </div>
          );
        },
      },
      {
        field: 'job_position',
        headerName: 'ตำแหน่ง',
        flex: 1.2,
        minWidth: 200,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => (
          <div className="flex justify-center items-center h-full">
            <Typography variant="body2">{params.value || '-'}</Typography>
          </div>
        ),
      },
      {
        field: 'organization',
        headerName: 'หน่วยงาน',
        flex: 1.2,
        minWidth: 200,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => (
          <div className="flex justify-center items-center h-full">
            <Typography variant="body2">{params.value || '-'}</Typography>
          </div>
        ),
      },
      {
        field: 'user_status',
        headerName: 'สถานะการใช้งาน',
        width: 160,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          // ✅ ถ้าไม่มีค่า ให้ ChipTag แสดงสถานะ "unknown"
          const statusTag = mapStatusToChipTag(params.value || 'unknown');
          return (
            <div className="flex justify-center items-center h-full w-full">
              <ChipTag tag={statusTag} />
            </div>
          );
        },
      },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        sortable: false,
        align: 'center',
        renderCell: (params) => (
          <div className="w-full h-full flex justify-center items-center gap-1">
            <IconButton
              size="small"
              onClick={() =>
                navigate('/settings/usermanage/userinfo', {
                  state: { uid: params.row.uid },
                })
              }
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(params.row.uid)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        ),
      },
    ],
    [handleDelete, navigate]
  );


  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 2, fontWeight: 'bold' }} className='text-primary-dark'>
        จัดการสิทธิ์การใช้งาน
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>Search</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'white' }}>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap -m-2'>
              <div className='w-full md:w-1/4 p-2'>
                <InputLabel shrink>ชื่อ</InputLabel>
                <TextField placeholder='ชื่อ' value={firstname} onChange={(event) => setFirstname(event.target.value)} />
              </div>
              <div className='w-full md:w-1/4 p-2'>
                <InputLabel shrink>นามสกุล</InputLabel>
                <TextField placeholder='นามสกุล' value={lastname} onChange={(event) => setLastname(event.target.value)} />
              </div>
              <div className='w-full md:w-1/4 p-2'>
                <InputLabel shrink>หน่วยงาน</InputLabel>
                {/* <Select
                  displayEmpty
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value as string)}
                  renderValue={(selected) => (selected ? selected : 'เลือกหน่วยงาน')}
                >
                  <MenuItem value=''><em>ทั้งหมด</em></MenuItem>
                  {organizationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select> */}
                <Autocomplete
                  options={departmentList}
                  getOptionLabel={(option) => option.dep_name}
                  value={departmentList.find((d) => d.uid === organization) || null}
                  onChange={(_, newValue) => setOrganization(newValue ? newValue.uid : null)}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="เลือกหน่วยงาน" />
                  )}
                />
              </div>
              <div className='w-full md:w-1/4 p-2'>
                <InputLabel shrink>สถานะผู้ใช้งาน</InputLabel>
                <Select
                  displayEmpty
                  value={status}
                  onChange={(event) => setStatus(event.target.value as string)}
                  renderValue={(selected) => {
                    if (!selected) {
                      return 'เลือกสถานะ';
                    }
                    const match = statusOptions.find((item) => item.value === selected);
                    return match?.label ?? selected;
                  }}
                >
                  <MenuItem value=''><em>ทั้งหมด</em></MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
            <div className='w-full flex justify-end gap-2 p-2'>
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

      <Stack direction='row' spacing={1} sx={{ my: 2 }}>
        <Button
          variant='contained'
          size='small'
          startIcon={<AddIcon />}
          onClick={() => navigate('/settings/usermanage/userinfo')}
          className='!bg-gold hover:!bg-gold-dark'
        >
          เพิ่มผู้ใช้งาน
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant='body2' sx={{ alignSelf: 'center' }}>
          ผลการค้นหา : {rowCount.toLocaleString()} รายการ
        </Typography>
      </Stack>

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={loading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </Box>
  );
};

export default UserListPage;
