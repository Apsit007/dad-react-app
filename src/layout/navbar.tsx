// src/layout/Navbar.tsx
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { Avatar } from '@mui/material';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
    return (
        <header className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between sticky top-0 z-10">
            {/* Left Side: Toggle Button & Breadcrumb */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
                    <MenuIcon />
                </button>
                <span className="text-gray-500 font-semibold">Feed-Extend Menu</span>
            </div>

            {/* Right Side: Notifications & User Profile */}
            <div className="flex items-center gap-6">
                <button className="text-gray-600 hover:text-gray-900">
                    <NotificationsNoneOutlinedIcon />
                </button>
                <div className="flex items-center gap-3">
                    <Avatar sx={{ width: 32, height: 32 }}>J</Avatar>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">ปวริศา เตชะกุลวิเศษ</p>
                        <p className="text-xs text-gray-500">เจ้าหน้าที่ดูแลระบบ</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;