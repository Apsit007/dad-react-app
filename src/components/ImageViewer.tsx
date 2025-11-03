// src/components/ImageViewer.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ImageViewerProps {
    open: boolean;
    imgUrls: string[];
    onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ open, imgUrls, onClose }) => {
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
                        className="flex items-center justify-center bg-neutral-900 rounded-lg shadow-lg w-[450px] h-[450px]"
                    >
                        <img
                            src={url}
                            alt={`preview-${i}`}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                ))}
            </div>

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
