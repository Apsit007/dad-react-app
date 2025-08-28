// src/layout/Sidebar.tsx
import { useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import menuItemsData from '../services/MenuItem.json';
import { NavLink } from 'react-router-dom';

const iconMap = {
    DashboardIcon: DashboardIcon,
    SearchIcon: SearchIcon,
    StorageIcon: StorageIcon,
    SettingsIcon: SettingsIcon,
};
type MenuItem = {
    name: string;
    icon: string;
    path?: string;
    subMenus?: {
        name: string;
        path: string;
    }[];
};

interface SidebarProps {
    isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const menuItems: MenuItem[] = menuItemsData;
    const handleSubMenuToggle = (name: string) => {
        setOpenSubMenu(openSubMenu === name ? null : name);
    };
    const activeLinkStyle = {
        backgroundColor: '#2E514E',
        borderLeft: '3px solid #C9EFA4',
        // Use boxShadow to prevent content shift from the border
        boxShadow: 'inset 3px 0 0 0 #C9EFA4',
    };

    return (
        <aside className={`fixed top-6 left-6 pt-2 bg-sidebar-gradient rounded-md text-white transition-all duration-300 ease-in-out flex flex-col h-[calc(100vh-3rem)] ${isCollapsed ? 'w-20' : 'w-64'}`}>

            {/* Logo and Title */}
            <div className="flex items-center p-4 h-16 ">
                <div className="bg-white p-1 rounded-full">
                    <img src="/imgs/dad_logo_circle.png" alt="Logo" className="w-10 h-10" />
                </div>
                {!isCollapsed && <span className="ml-3 text-lg font-bold">License Plate</span>}
            </div>

            {/* Menu Items */}
            <nav className="flex-grow pt-4">
                <ul>
                    {menuItems.map((item) => {
                        // 3. Look up the icon component from the map
                        const IconComponent = iconMap[item.icon as keyof typeof iconMap];

                        return (
                            <li key={item.name} className="px-4 mb-2">
                                <NavLink
                                    to={item.path || '#'}
                                    onClick={() => item.subMenus && handleSubMenuToggle(item.name)}
                                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                                    className="flex items-center p-2 rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    {/* 4. Render the found icon component */}
                                    {IconComponent && <IconComponent />}

                                    {!isCollapsed && <span className="ml-4 flex-1">{item.name}</span>}
                                    {!isCollapsed && item.subMenus && (
                                        <KeyboardArrowDownIcon className={`transition-transform ${openSubMenu === item.name ? 'rotate-180' : ''}`} />
                                    )}
                                </NavLink>
                                {/* Sub Menu */}
                                {!isCollapsed && openSubMenu === item.name && item.subMenus && (
                                    <ul className="pl-8 pt-2">
                                        {item.subMenus.map((subItem) => (
                                            <NavLink
                                                to={subItem.path}
                                                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                                                className="block p-2 rounded-md hover:bg-primary-dark transition-colors text-sm"
                                            >
                                                {subItem.name}
                                            </NavLink>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
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