// src/layout/MainLayout.tsx
import { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLprRegions } from '../store/slices/masterdataSlice';
import type { AppDispatch, RootState } from '../store';



const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const lastFetchedAt = useSelector((s: RootState) => s.masterdata.lastFetchedAt);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Preload masterdata (LPR regions) once on first render
    useEffect(() => {
        if (!lastFetchedAt) dispatch(fetchLprRegions());
    }, [dispatch, lastFetchedAt]);

    // ✅ Auto collapse on small screen
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1630) {
                setIsCollapsed(true);   // หุบอัตโนมัติ
            } else {
                setIsCollapsed(false);  // ขยายอัตโนมัติเมื่อจอกว้าง
            }
        };

        handleResize(); // run ครั้งแรก
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className=" min-h-screen p-6">
            <div>
                <Sidebar isCollapsed={isCollapsed} />

                {/* ✨margin-left แบบไดนามิกตามสถานะของ Sidebar */}
                <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-28' : 'ml-72'}`}>
                    <div className="flex flex-col gap-4 h-[calc(100vh-3rem)]">
                        <Navbar toggleSidebar={toggleSidebar} />

                        <main className="flex-1 flex flex-col pb-4">
                            <div className='h-full flex flex-col bg-white p-4 rounded-lg shadow-md'>
                                <div className="flex-1 overflow-y-auto overflow-x-auto">
                                    <Outlet />
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
