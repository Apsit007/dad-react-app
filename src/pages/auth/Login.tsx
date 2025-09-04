// src/pages/auth/Login.tsx
import { Box, Paper, TextField, Button, Typography, Link, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store';

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, accessToken } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ username, password }))
      .unwrap() // ใช้ .unwrap() เพื่อ throw error ตรงๆ
      .then(() => {
        navigate('/dashboard'); // ถ้า login สำเร็จ → ไป dashboard
      })
      .catch(() => {
        // error ถูกเก็บใน Redux อยู่แล้ว แต่ถ้าอยากโชว์เพิ่มก็ทำได้
      });
  };

  return (
    <Box className="min-h-screen" sx={{ bgcolor: '#2E6F69' }} display="flex" alignItems="center" justifyContent="center" p={2}>
      <Paper elevation={6} sx={{ width: 420, borderRadius: 2, p: 4, pt: 0 }}>
        {/* Logo + Title */}
        <div className='flex flex-col w-full h-52 items-center justify-center gap-2'>
          <img src="/imgs/dad_logo_circle.png" alt="Logo" style={{ width: 64, height: 64 }} />
          <Typography variant="h6" align='center'>
            <span className="bg-gradient-to-t from-[#79C350] to-[#d9e9bd] bg-clip-text text-transparent font-bold ">
              ระบบบริหารลานจอดรถอาคาร C
            </span>
            <br />
            <span style={{ color: '#2E6F69', fontWeight: 700 }}>ศูนย์ราชการเฉลิมพระเกียรติ 80 พรรษา</span>
          </Typography>
        </div>

        {/* Form */}
        <Box component="form" className='mt-4' onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              placeholder="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              placeholder="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              className="!bg-primary hover:!bg-primary-dark"
              sx={{ py: 1.2 }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </Button>
          </Stack>
        </Box>

        {/* Error */}
        {error && (
          <Box mt={2}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Box>
        )}

        <Box mt={2}>
          <Link href="#" underline="hover" color="inherit" variant='subtitle2'>ลืมรหัสผ่านหรือไม่?</Link>
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography variant="caption" color="text.secondary">Ver 1.0.0</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
