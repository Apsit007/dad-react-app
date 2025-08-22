// src/components/CustomDataGrid.tsx
import {
    DataGrid,
    type DataGridProps,
    type GridRowClassNameParams,
    GridFooterContainer,
    GridPagination,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';

// ฟังก์ชันนี้จะเป็นค่า default ถ้าไม่มีการส่ง prop getRowClassName เข้ามา
const defaultGetRowClassName = (params: GridRowClassNameParams) => {
    return params.row.isBlacklist ? 'highlight-row' : '';
};

// สร้าง Custom Footer Component ของเราเอง
function CustomFooter() {
    return (
        <GridFooterContainer>
            <GridPagination />
        </GridFooterContainer>
    );
}


const CustomDataGrid = (props: DataGridProps) => {
    return (
        // 2. เพิ่ม Wrapper Box เพื่อควบคุมขนาด
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                // รับ props ทั้งหมดที่ส่งเข้ามา
                {...props}

                // --- ค่า Default ที่เรากำหนดเอง ---
                rowHeight={70}
                getRowClassName={props.getRowClassName || defaultGetRowClassName} // 3. ทำให้ยืดหยุ่น
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    ...props.initialState,
                }}
                pageSizeOptions={[10, 20, 50]}
                slots={{
                    footer: CustomFooter,
                    ...props.slots,
                }}
                sx={{
                    // 1. นำสไตล์หัวตารางกลับมา
                    '&& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#1A486C',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    '&& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#1A486C',
                    },
                    // สไตล์สำหรับแถวไฮไลท์
                    '&& .highlight-row': {
                        bgcolor: 'rgba(255, 0, 0, 0.08) !important',
                    },
                    ...props.sx,
                }}
            />
        </Box>
    );
};

export default CustomDataGrid;