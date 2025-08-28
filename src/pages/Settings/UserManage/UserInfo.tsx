// src/pages/Settings/UserManage/UserInfo.tsx
import { useState } from 'react';
import { Paper, Typography, Box, TextField, Select, MenuItem, Button, Avatar, FormControlLabel, InputLabel, Checkbox, Stack } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { type GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../components/DataTable';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Permissions table
const permColumns: GridColDef[] = [
  { field: 'id', headerName: 'ลำดับ', width: 90, align: 'center', headerAlign: 'center' },
  { field: 'menu', headerName: 'ชื่อเมนู', flex: 1.4, minWidth: 220, headerAlign: 'center' },
  {
    field: 'allow', headerName: 'สิทธิ์การใช้งาน', width: 160, align: 'center', headerAlign: 'center', sortable: false,
    renderCell: (params) => <Checkbox checked={Boolean(params.value)} />,
  },
];
const permRows = [
  { id: 1, menu: 'ข้อมูลการเข้า-ออกพื้นที่', allow: true },
  { id: 2, menu: 'ค้นหารถ', allow: true },
  { id: 3, menu: 'ค้นหาบุคคล', allow: true },
  { id: 4, menu: 'บันทึกข้อมูลรถ', allow: true },
  { id: 5, menu: 'บันทึกข้อมูลบุคคล', allow: true },
  { id: 6, menu: 'ตั้งค่าระบบ', allow: true },
  { id: 7, menu: 'จัดการสิทธิ์การใช้งาน', allow: true },
];

const UserInfoPage = () => {
  const [inactive, setInactive] = useState(false);

  return (
    <div className='flex flex-col'>
      <div className="flex flex-wrap lg:flex-nowrap gap-6">

        {/* Left Column */}
        <div className="w-full lg:w-7/12 flex flex-col gap-6">
          {/* Person Info Card */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>ข้อมูลบุคคล</Typography>
            <div className="flex flex-wrap -m-2">
              {/* Avatar */}
              <div className="w-full md:w-1/3 p-2">
                <div className='relative'>
                  <Avatar sx={{ width: 170, height: 170, m: 'auto' }} className='border-[5px] border-gold-light' />
                  <Typography variant="caption" display="block" align="center" className='absolute bottom-7 left-[75px]' mt={1}>ขนาดภาพ 50-100 kb</Typography>
                </div>
                <div className="mt-2 text-center">
                  <FormControlLabel control={<Checkbox />} label="Inactive" />
                </div>
              </div>

              {/* Form Fields */}
              <div className="w-full md:w-2/3 p-2">
                <div className="flex flex-wrap -m-2">
                  <div className="w-full sm:w-[30%] p-2">
                    <InputLabel shrink required>คำนำหน้า</InputLabel>
                    <Select defaultValue="mr">
                      <MenuItem value="mr">นาย</MenuItem>
                      <MenuItem value="mrs">นาง</MenuItem>
                      <MenuItem value="miss">นางสาว</MenuItem>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink required>ชื่อ</InputLabel>
                    <TextField />
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink required>นามสกุล</InputLabel>
                    <TextField />
                  </div>

                  <div className="w-full sm:w-[30%] p-2">
                    <InputLabel shrink required>เพศ</InputLabel>
                    <Select defaultValue="male">
                      <MenuItem value="male">เลือกเพศ</MenuItem>
                      <MenuItem value="female">หญิง</MenuItem>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink required>เลขที่บัตรประชาชน</InputLabel>
                    <TextField />
                  </div>
                  <div className="w-full sm:w-[35%] p-2">
                    <InputLabel shrink>วันเกิด</InputLabel>
                    <DatePicker />
                  </div>

                  <div className="w-full sm:w-1/3 p-2">
                    <InputLabel shrink required>เบอร์โทร</InputLabel>
                    <TextField />
                  </div>
                  <div className="w-full sm:w-2/3 p-2">
                    <InputLabel shrink>Email</InputLabel>
                    <TextField />
                  </div>
                </div>
              </div>

              {/* Bottom row of fields */}
              <div className='w-full flex flex-row'>

                <div className="w-full p-2">
                  <InputLabel shrink>สังกัดหน่วยงาน</InputLabel>
                  <TextField />
                </div>
                <div className="w-full p-2">
                  <InputLabel shrink>เลขบัตรพนักงาน</InputLabel>
                  <TextField />
                </div>
              </div>
              <div className="w-full p-2">
                <InputLabel shrink>หมายเหตุ</InputLabel>
                <TextField multiline rows={2} />
              </div>
            </div>

            <div className="flex flex-wrap -m-2 mt-14 border-t-[1px] border-gray-600 pt-4">
              <div className="w-full sm:w-1/2 p-2">
                <InputLabel shrink required>Username</InputLabel>
                <TextField />
              </div>
              <div className="w-full sm:w-1/2 p-2">
                <InputLabel shrink required>Password</InputLabel>
                <TextField type='password' />
              </div>
            </div>
          </Paper>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          {/* Additional Info Card */}
          <div className='py-2 px-4 bg-primary text-white'>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', bgcolor: '#36746F', px: 2, py: 1, borderRadius: 1, mb: 2 }}>
              สิทธิ์การใช้งาน
            </Typography>
            <Box >
              <DataTable rows={permRows} columns={permColumns}
                sx={{
                  '&& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#2E514E',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                  '&& .MuiDataGrid-columnHeader': {
                    backgroundColor: '#2E514E',
                  },
                  // Alternating row colors
                  '& .MuiDataGrid-row:nth-of-type(odd)': {
                    backgroundColor: '#FFFFFF',
                  },
                  '& .MuiDataGrid-row:nth-of-type(even)': {
                    backgroundColor: '#e7e8e9',
                  },
                }} />
            </Box>
          </div>
        </div>

      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full flex justify-end gap-2 mt-6">
        <Button variant="outlined" className='!border-primary !bg-white !text-primary' startIcon={<CloseOutlinedIcon />}>ยกเลิก</Button>
        <Button variant="contained" startIcon={<SaveOutlinedIcon />} className="!bg-primary hover:!bg-primary-dark">บันทึก</Button>
      </div>
    </div>
  );
};

export default UserInfoPage;

