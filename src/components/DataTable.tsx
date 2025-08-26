// src/components/CustomDataGrid.tsx
import {
    DataGrid,
    type DataGridProps,
    type GridRowClassNameParams,
    GridFooterContainer,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
} from '@mui/x-data-grid';
import { Box, Pagination } from '@mui/material';

// ฟังก์ชันนี้จะเป็นค่า default ถ้าไม่มีการส่ง prop getRowClassName เข้ามา
const defaultGetRowClassName = (params: GridRowClassNameParams) => {
    return params.row.isBlacklist ? 'highlight-row' : '';
};

const CustomDataGrid = (props: DataGridProps) => {
    return (
        // 2. เพิ่ม Wrapper Box เพื่อควบคุมขนาด
        // <Box sx={{ height: '100%', width: '100%' }}>
        <Box sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: 0,
        }}>
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
                        backgroundColor: '#36746F',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    '&& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#36746F',
                    },
                    // สไตล์สำหรับแถวไฮไลท์
                    '&& .highlight-row': {
                        bgcolor: 'rgba(255, 0, 0, 0.08) !important',
                    },
                    flex: 1,
                    ...props.sx,
                }}
            />
        </Box>
    );
};

export default CustomDataGrid;

// ✨ 1. Create a new, fully custom pagination component
function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1} // MUI Pagination is 1-based, DataGrid is 0-based
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
    );
}


// ✨ 2. Update the CustomFooter to use the new pagination
function CustomFooter() {
    return (
        <GridFooterContainer sx={{ justifyContent: 'flex-end' }}>
            <CustomPagination />
        </GridFooterContainer>
    );
}