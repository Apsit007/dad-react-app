// src/components/ImageViewer.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ImageViewerProps {
    open: boolean;
    imgUrl: string | null;
    onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ open, imgUrl, onClose }) => {
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

    if (!open || !imgUrl) return null;

    const content = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm "
            onClick={onClose}
        >
            <img
                src={imgUrl}
                alt="preview"
                className="max-h-[90%] max-w-[90%] object-contain rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()} // กันคลิกทะลุ
            />

            {/* ปุ่มปิด */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white text-3xl font-bold"
            >
                ✕
            </button>
        </div>
    );

    return createPortal(content, document.body);
};

export default ImageViewer;
