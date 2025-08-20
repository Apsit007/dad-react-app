// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    // คุณสามารถกำหนดสีหลัก, font, หรืออื่นๆ ได้ตรงนี้
    // palette: {
    //   primary: {
    //     main: '#1A486C',
    //   },
    // },

    // ส่วนสำคัญคือการ override สไตล์ของ component
    components: {
        // เลือก Component ที่ต้องการจะ override
        MuiDataGrid: {
            styleOverrides: {
                // เลือกส่วนย่อย (slot) ของ component ที่ต้องการแก้
                // ในที่นี้คือ 'columnHeaders' (ตัวครอบ) และ 'columnHeader' (แต่ละช่อง)
                columnHeaders: {
                    backgroundColor: '#1A486C',
                    color: 'white',
                    fontWeight: 'bold',
                },
                columnHeader: {
                    backgroundColor: '#1A486C',
                }
            },
        },
    },
});

export default theme;