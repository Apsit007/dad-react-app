// src/layout/Sidebar.tsx
import { useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import menuItemsData from '../services/MenuItem.json';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

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
        permission?: string; // 🔑 map permission
    }[];
    permission?: string; // 🔑 map permission
};

interface SidebarProps {
    isCollapsed: boolean;
    onExpand: () => void;
}

const Sidebar = ({ isCollapsed, onExpand }: SidebarProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    // 1) กำหนด type ของ permissions ชัดเจน
    const permissions: Record<string, boolean> = useSelector((state: RootState) => state.auth.user?.permissions || {});
    // 2) กำหนด mapping ของเมนู -> permission key
    const menuPermissionMap: Record<string, string> = {
        Dashboard: 'dashboard',
        ค้นหาบุคคล: 'person_search',
        ค้นหารถ: 'car_search',
        ค้นหาVDO: 'video_search',
        ข้อมูลรถ: 'car_manage',
        ข้อมูลบุคคล: 'person_manage',
        ตั้งค่าระบบ: 'system_manage',
        จัดการสิทธิ์การใช้งาน: 'user_manage',
        จัดการข้อมูลหน่วยงาน: 'department_manage',
    };

    // 3) ฟังก์ชันกรองเมนูตามสิทธิ์
    const filterMenuItems = (items: MenuItem[]) => {
        return items
            .map((item) => {
                const subMenus = item.subMenus?.filter(
                    (sub) => permissions[menuPermissionMap[sub.name]] === true
                );

                // ถ้าเมนูนี้มี subMenus และมีสิทธิ์เข้าถึงบางอัน
                if (subMenus && subMenus.length > 0) {
                    return { ...item, subMenus };
                }

                // ถ้าเป็นเมนูหลักที่ map กับ permission โดยตรง
                if (menuPermissionMap[item.name] && permissions[menuPermissionMap[item.name]] === true) {
                    return { ...item, subMenus: undefined };
                }

                return null;
            })
            .filter(Boolean) as MenuItem[];
    };

    const menuItems = filterMenuItems(menuItemsData as MenuItem[]);

    const handleSubMenuToggle = (name: string) => {
        setOpenSubMenu(openSubMenu === name ? null : name);
    };

    const activeLinkStyle = {
        backgroundColor: '#2E514E',
        borderLeft: '3px solid #C9EFA4',
        // Use boxShadow to prevent content shift from the border
        boxShadow: 'inset 3px 0 0 0 #C9EFA4',
    };



    const handleLogout = () => {
        dispatch(logout());           // ✅ ล้าง token และ state ใน Redux
        navigate('/login');           // ✅ กลับไปหน้า login
    };

    return (
        <aside className={`fixed top-6 left-6 pt-2 bg-sidebar-gradient rounded-md text-white transition-all duration-300 ease-in-out flex flex-col h-[calc(100vh-3rem)] ${isCollapsed ? 'w-20' : 'w-64'}`}>

            {/* Logo and Title */}
            <div className="flex items-center p-4 h-16 ">
                <div className="bg-white p-1 rounded-full w-fit">
                    <img src="/imgs/dad_logo_circle.png" alt="Logo" className="!w-[65px] h-10" />
                </div>
                {!isCollapsed && <span className="ml-3 text-md font-bold">License Plate
                    Recognition System</span>}
            </div>

            {/* Menu Items */}
            <nav className="flex-grow pt-4">
                <ul>
                    {menuItems.map((item) => {
                        // 3. Look up the icon component from the map
                        const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                        // Determine if any of this item's submenus is active
                        const hasActiveSub = (item.subMenus || []).some(
                            (sub) => location.pathname.startsWith(`/${sub.path}`)
                        );

                        return (
                            <li key={item.name} className="px-4 mb-2">
                                <NavLink
                                    to={item.path || '#'}
                                    // onClick={() => item.subMenus && handleSubMenuToggle(item.name)}
                                    onClick={(e) => {
                                        if (isCollapsed) {
                                            e.preventDefault(); // กันไม่ให้ navigate ทันที
                                            onExpand();          // ✅ สั่งขยายก่อน
                                        } else if (item.subMenus) {
                                            handleSubMenuToggle(item.name);
                                        }
                                    }}
                                    style={({ isActive }) => {
                                        // If this item has submenus, rely only on submenu matching
                                        if (item.subMenus && item.subMenus.length > 0) {
                                            return hasActiveSub ? activeLinkStyle : undefined;
                                        }
                                        // Otherwise, rely on the link's active state
                                        return isActive ? activeLinkStyle : undefined;
                                    }}
                                    className="flex items-center p-2 rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    {/* 4. Render the found icon component */}
                                    {IconComponent && <IconComponent />}

                                    {!isCollapsed && <span className="ml-4 flex-1">{item.name}</span>}
                                    {!isCollapsed && item.subMenus && (
                                        <KeyboardArrowDownIcon className={`transition-transform ${openSubMenu === item.name ? 'rotate-180' : ''}`} />
                                    )}
                                </NavLink>
                                {/* Sub Menu with animation */}
                                <Collapse in={!isCollapsed && openSubMenu === item.name} timeout={200} unmountOnExit>
                                    {item.subMenus && (
                                        <ul className="pl-8 pt-2">
                                            {item.subMenus.map((subItem) => (
                                                <NavLink
                                                    key={subItem.path}
                                                    to={subItem.path}
                                                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                                                    className="block p-2 rounded-md hover:bg-primary-dark transition-colors text-sm"
                                                >
                                                    {subItem.name}
                                                </NavLink>
                                            ))}
                                        </ul>
                                    )}
                                </Collapse>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center p-2 w-full rounded-md hover:bg-primary-dark transition-colors text-left"
                >
                    <LogoutIcon />
                    {!isCollapsed && <span className="ml-4">ออกจากระบบ</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
