// src/components/CustomDataGrid.tsx
import {
    DataGrid,
    type DataGridProps,
    type GridRowClassNameParams,
    GridFooterContainer, // ✨ 1. Import เพิ่ม
    GridPagination,       // ✨ 2. Import เพิ่ม
} from '@mui/x-data-grid';
import { Box } from '@mui/material';

// ฟังก์ชันสำหรับกำหนด class ให้กับแถว (เหมือนเดิม)
const getRowClassName = (params: GridRowClassNameParams) => {
    return params.row.isBlacklist ? 'highlight-row' : '';
};

// ✨ 3. สร้าง Custom Footer Component ของเราเอง
function CustomFooter() {
    return (
        <GridFooterContainer>
            {/* เราจะใส่แค่ Pagination และไม่ใส่ตัวนับแถว (GridSelectedRowCount) */}
            <GridPagination />
        </GridFooterContainer>
    );
}


const CustomDataGrid = (props: DataGridProps) => {
    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            '& .highlight-row': {
                bgcolor: 'rgba(255, 0, 0, 0.08) !important',
            },
        }}>
            <DataGrid
                {...props}
                rowHeight={70}
                getRowClassName={getRowClassName}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    ...props.initialState,
                }}
                pageSizeOptions={[10, 20, 50]}
                // checkboxSelection
                slots={{
                    // ✨ 4. บอกให้ DataGrid ใช้ CustomFooter ของเราแทนที่ Footer เดิม
                    footer: CustomFooter,
                    ...props.slots,
                }}
                sx={{
                    ...props.sx,
                }}
            />
        </Box>
    );
};

export default CustomDataGrid;