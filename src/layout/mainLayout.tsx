// src/layout/MainLayout.tsx
import { useState, type ReactNode } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';
import { Paper } from '@mui/material';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="flex gap-6 items-start">

                <Sidebar
                    isCollapsed={isCollapsed}
                    className="sticky top-6 h-[calc(100vh-3rem)]"
                />

                {/* ✨ 1. เอา h-[...] และ overflow-y-auto ออกจาก div นี้ */}
                <div className="flex-1 flex flex-col gap-6">

                    <Navbar toggleSidebar={toggleSidebar} />

                    {/* ✨ 2. เพิ่ม h-0 และ overflow-y-auto เข้าไปที่ <main> */}
                    <main className="flex-1 h-0 overflow-y-auto">
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            {children}
                        </Paper>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;