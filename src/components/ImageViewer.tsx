// src/components/ImageViewer.tsx
import { Avatar, Typography } from "@mui/material";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ImageViewerProps {
    open: boolean;
    imgUrls: string[];
    title?: string[],
    video?: boolean;
    onClose: () => void;
}



const ImageViewer: React.FC<ImageViewerProps> = ({ open, imgUrls, title, video, onClose }) => {
    const getBgClass = (title: string) => {
        switch (title) {
            case "Watchlist":
                return "bg-gradient-to-tr from-[#E29578] to-[#ebbbaa]";
            case "VIP":
                return "bg-gradient-to-tr from-[#FFC300] to-[#ffdd62]";
            case "Guest":
                return "bg-gradient-to-tr from-[#7785AC] to-[#a6b1cc]";
            case "Member":
                return "bg-gradient-to-tr from-[#EA8810] to-[#FFB84D]";
            case "Visitor":
                return "bg-gradient-to-tr from-[#6EA7E1] to-[#90bef3]";
            case "Blacklist":
                return "bg-gradient-to-tr from-[#9F0C0C] to-[#cf4432]";
            default:
                return "bg-gradient-to-tr from-[#6EA7E1] to-[#90bef3]"; // fallback
        }
    };
    const getThText = (title: string) => {
        switch (title) {
            case "Watchlist":
                return "เฝ้าระวัง";
            case "VIP":
                return "บุคคลสำคัญ";
            case "Blacklist":
                return "ต้องห้าม";
            case "Guest":
                return "ผู้มาติดต่อ";
            case "Member":
                return "สมาชิก";
            case "Visitor":
                return "ทั่วไป";
            default:
                return "ทั่วไป"; // fallback
        }
    };
    const getThTitle = (title: number) => {
        switch (title) {
            case 0:
                return "รถ";
            case 1:
                return video ? "ทะเบียน" : "บุคคลที่ตรวจจับ";
            case 2:
                return "บุคคลที่ลงทะเบียน";
            default:
                return "-"; // fallback
        }
    };


    // ปิดด้วยปุ่ม Esc
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) {
            window.addEventListener("keydown", handleKey);
        }
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open || !imgUrls.length) return null;

    const content = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* กล่องรูปภาพ */}
            <div
                className="flex flex-wrap gap-4 justify-center items-center max-h-[90%] max-w-[90%] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {imgUrls.map((url, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-center bg-neutral-900 rounded-lg shadow-lg w-[450px] h-[450px] relative"
                    >
                        {title &&

                            <div className="absolute w-full left-0 top-0 z-10 flex">
                                <div
                                    className={`${getBgClass(title![i])} text-white px-3 py-1  shadow w-full`}
                                >
                                    <Typography variant="subtitle1" className="!font-semibold">
                                        {getThTitle(i)}  : {getThText(title![i])} ( {title![i] ?? "Visitor"} )
                                    </Typography>

                                </div>
                            </div>

                        }
                        {url ?
                            <img
                                src={url}
                                alt={`preview-${i}`}
                                className="max-w-full max-h-full w-full h-auto rounded-lg"
                            /> :
                            <Avatar
                                variant="square"
                                src={url}
                                alt={`preview-${i}`}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "8px",
                                    bgcolor: "#1e1e1e",
                                }}
                            />
                        }




                    </div>
                ))
                }
            </div >

            {/* ปุ่มปิด */}
            < button
                onClick={onClose}
                className="absolute top-5 right-5 text-white text-3xl font-bold"
            >
                ✕
            </button >
        </div >
    );
    return createPortal(content, document.body);
};

export default ImageViewer;
