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

                <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-3rem)]">

                    <Navbar toggleSidebar={toggleSidebar} />

                    <main className="flex-1 ">
                        <div className='h-full flex flex-col bg-white p-4 rounded-lg shadow-md'>
                            <div className="flex-1 ">
                                {children}
                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;