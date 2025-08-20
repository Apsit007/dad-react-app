// src/layout/MainLayout.tsx
import { useState, type ReactNode } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className=" min-h-screen p-6">
            <div>
                <Sidebar isCollapsed={isCollapsed} />

                {/* ✨margin-left แบบไดนามิกตามสถานะของ Sidebar */}
                <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-28' : 'ml-72'}`}>
                    <div className="flex flex-col gap-6 h-[calc(100vh-3rem)]">
                        <Navbar toggleSidebar={toggleSidebar} />

                        <main className="flex-1 flex flex-col">
                            <div className='h-full flex flex-col bg-white p-4 rounded-lg shadow-md'>
                                <div className="flex-1 overflow-y-auto overflow-x-auto">
                                    {children}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;