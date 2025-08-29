// src/layout/Navbar.tsx
import { useState, useEffect, useRef } from 'react'; // 1. Import hooks
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { Avatar, Typography } from '@mui/material';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
    // 2. Create a ref to target the navbar element
    const navRef = useRef<HTMLElement>(null);
    // 3. Create state to track if the navbar is sticky
    const [isSticky, setIsSticky] = useState(false);

    // 4. Set up the IntersectionObserver to watch the navbar
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When the navbar is not intersecting (i.e., scrolled up), set sticky to true
                setIsSticky(!entry.isIntersecting);
            },
            {
                root: null, // observes intersections relative to the viewport
                threshold: 1.0, // trigger when 100% of the element is visible/invisible
                // A small negative rootMargin ensures it triggers just as it's about to stick
                rootMargin: "-1px 0px 0px 0px",
            }
        );

        if (navRef.current) {
            observer.observe(navRef.current);
        }

        // Cleanup observer on component unmount
        return () => {
            if (navRef.current) {
                observer.unobserve(navRef.current);
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // 5. Define styles based on the isSticky state
    const baseClasses = "p-4 flex items-center justify-between transition-all duration-300 ease-in-out";
    const defaultStateClasses = "bg-white rounded-lg shadow-md";
    // When sticky, it becomes full-width, loses its border-radius, and adjusts padding
    const stickyStateClasses = " bg-white shadow-lg w-full rounded-md px-8";

    return (
        // Assign the ref and dynamically apply classes
        <header
            ref={navRef}
            className={`${baseClasses} ${isSticky ? stickyStateClasses : defaultStateClasses}`}
            // We still need sticky positioning from the layout
            style={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
            {/* Left Side: Toggle Button & Breadcrumb */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
                    <MenuIcon />
                </button>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} className='text-primary-dark'>ระบบบริหารลานจอดรถ อาคาร C ศูนย์ราชการเฉลิมพระเกียรติ 80 พรรษา</Typography>
            </div>

            {/* Right Side: Notifications & User Profile */}
            <div className="flex items-center gap-6">
                <button className="text-gray-600 hover:text-gray-900">
                    <NotificationsNoneOutlinedIcon />
                </button>
                <div className="flex items-center gap-3">
                    <Avatar sx={{ width: 32, height: 32 }}>J</Avatar>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">Pawarisa Techakulwiset</p>
                        <p className="text-xs text-gray-500">System Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;