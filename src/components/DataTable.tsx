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
import { Box, Pagination, Select, MenuItem } from '@mui/material';

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
                paginationMode="server"
                // --- ค่า Default ที่เรากำหนดเอง ---
                rowHeight={60}
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
                    '&& .expirewarning-row': {
                        bgcolor: 'rgba(247, 223, 6, 0.08) !important',
                    },
                    '&& .expired-row': {
                        bgcolor: 'rgba(255, 115, 0, 0.08) !important',
                    },
                    '&& .terminated-row': {
                        bgcolor: 'rgba(255, 0, 0, 0.08) !important',
                    },
                   
                    flex: 1,
                    ...props.sx,
                }}
                onPaginationModelChange={(model, details) => {
                    console.log('Page:', model.page, 'Limit:', model.pageSize);
                    props.onPaginationModelChange?.(model, details);
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
        <div className='flex gap-6 w-full justify-end'>
            <div className=''>
                <Pagination
                    color="primary"
                    variant="outlined"

                    count={pageCount}
                    page={page + 1} // MUI Pagination is 1-based, DataGrid is 0-based
                    onChange={(event, value) => apiRef.current.setPage(value - 1)}
                    sx={{
                        '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                            height: 36,
                            minWidth: 54,
                            mx: 0.3,
                            bgcolor: '#fff',
                            borderColor: '#E0E3E7',
                        },
                        '& .MuiPaginationItem-root.Mui-selected': {
                            bgcolor: '#36746F',
                            color: '#fff',
                            borderColor: '#36746F',
                            '&:hover': {
                                bgcolor: '#2f625d',
                            },
                        },
                    }}
                />
            </div>
            <div className='!w-[120px]'>
                <Select
                    size="small"
                    value={page + 1}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        apiRef.current.setPage(value - 1);
                    }}
                    sx={{
                        height: 36,
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E3E7',
                        },
                    }}
                >
                    {Array.from({ length: pageCount }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                </Select>
            </div>

        </div>
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
