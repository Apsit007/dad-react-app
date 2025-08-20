// src/layout/Sidebar.tsx
import { useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// กำหนดโครงสร้างของเมนู
const menuItems = [
    { name: "Dashboard", icon: DashboardIcon, path: "#" },
    { name: "ค้นหา", icon: SearchIcon, path: "#" },
    {
        name: "ข้อมูลพื้นฐาน",
        icon: StorageIcon,
        subMenus: [
            { name: "หมวดหมู่", path: "#" },
            { name: "ประเภท", path: "#" },
        ]
    },
    { name: "จัดการผู้ใช้งาน", icon: SettingsIcon, path: "#" },
];

interface SidebarProps {
    isCollapsed: boolean;
    className?: string;
}

const Sidebar = ({ isCollapsed, className = '' }: SidebarProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    const handleSubMenuToggle = (name: string) => {
        setOpenSubMenu(openSubMenu === name ? null : name);
    };

    return (
        <aside className={`relative bg-sidebar-gradient rounded-md text-white  ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out flex flex-col ${className}`}>


            {/* Logo and Title */}
            <div className="flex items-center p-4 h-16 ">
                <div className="bg-white p-1 rounded-full">
                    <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
                </div>
                {!isCollapsed && <span className="ml-3 text-lg font-bold">License Plate</span>}
            </div>

            {/* Menu Items */}
            <nav className="flex-grow pt-4">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name} className="px-4 mb-2">
                            <a
                                href={item.path || '#'}
                                onClick={() => item.subMenus && handleSubMenuToggle(item.name)}
                                className="flex items-center p-2 rounded-md hover:bg-primary-dark transition-colors"
                            >
                                <item.icon />
                                {!isCollapsed && <span className="ml-4 flex-1">{item.name}</span>}
                                {!isCollapsed && item.subMenus && (
                                    <KeyboardArrowDownIcon className={`transition-transform ${openSubMenu === item.name ? 'rotate-180' : ''}`} />
                                )}
                            </a>
                            {/* Sub Menu */}
                            {!isCollapsed && openSubMenu === item.name && item.subMenus && (
                                <ul className="pl-8 pt-2">
                                    {item.subMenus.map((subItem) => (
                                        <li key={subItem.name} className="mb-2">
                                            <a href={subItem.path} className="block p-2 rounded-md hover:bg-primary-dark transition-colors text-sm">
                                                {subItem.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 ">
                <a href="#" className="flex items-center p-2 rounded-md hover:bg-primary-dark transition-colors">
                    <LogoutIcon />
                    {!isCollapsed && <span className="ml-4">ออกจากระบบ</span>}
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;