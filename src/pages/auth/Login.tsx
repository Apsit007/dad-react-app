// src/pages/auth/Login.tsx
import { Box, Paper, TextField, Button, Typography, Link, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate real auth
    navigate('/dashboard');
  };

  return (
    <Box className="min-h-screen" sx={{ bgcolor: '#2E6F69' }} display="flex" alignItems="center" justifyContent="center" p={2}>
      <Paper elevation={6} sx={{ width: 420, borderRadius: 2, p: 4, pt: 2 }}>
        <div className='flex w-full h-32 items-center justify-center gap-2'>
          <img src="/imgs/dad_logo_circle.png" alt="Logo" style={{ width: 64, height: 64, margin: '10px 0 0 0' }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            <span className="bg-gradient-to-t from-[#79C350] to-[#d9e9bd] bg-clip-text text-transparent font-bold">
              License Plate
            </span>
            <br />
            <span style={{ color: '#2E6F69', fontWeight: 700 }}>Recognition System</span>
          </Typography>
        </div>


        <Box component="form" className='mt-4' onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField placeholder="Username" fullWidth />
            <TextField placeholder="Password" type="password" fullWidth />
            <Button variant="contained" type="submit" className="!bg-primary hover:!bg-primary-dark" sx={{ py: 1.2 }}>
              Login
            </Button>
          </Stack>
        </Box>

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

