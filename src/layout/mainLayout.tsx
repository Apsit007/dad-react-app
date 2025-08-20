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
        // 1. Container หลัก: สร้างระยะห่างจากขอบจอ
        <div className="bg-gray-100 min-h-screen p-5">
            {/* 2. Flex Container: จัดวาง Sidebar และ Content */}
            <div className="flex gap-8">

                {/* Sidebar */}
                <Sidebar isCollapsed={isCollapsed} className="sticky top-8 h-[calc(100vh-3rem)]" />

                {/* 3. Right Section: จัดวาง Navbar และ Content แนวตั้ง */}
                <div className="flex-1 flex flex-col gap-8 h-[calc(100vh-4rem)] ">

                    {/* Navbar */}
                    <Navbar toggleSidebar={toggleSidebar} />

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white p-4 rounded-lg shadow-md   ">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;