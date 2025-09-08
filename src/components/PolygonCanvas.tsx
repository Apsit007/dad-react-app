// src/components/PolygonCanvas.tsx
import React, { useEffect, useState } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";

interface PolygonCanvasProps {
    imageUrl: string;
    polygon: number[];
    setPolygon: (points: number[]) => void;
    drawing?: boolean; // เปิด/ปิดโหมด plot
}

const PolygonCanvas: React.FC<PolygonCanvasProps> = ({ imageUrl, polygon, setPolygon, drawing }) => {
    const [img, setImg] = useState<HTMLImageElement | null>(null);


    // โหลดรูป
    useEffect(() => {
        const image = new window.Image();
        image.src = imageUrl;
        image.onload = () => {
            setImg(image);
        };
    }, [imageUrl]);


    const handleClick = (e: any) => {
        if (!drawing) return; // ❌ ห้ามวาดถ้ายังไม่ start
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (pointer) {
            setPolygon([...polygon, pointer.x, pointer.y]);
        }
    };
    return (
        <Stage width={1080} height={560} onClick={handleClick}>
            <Layer>
                {/* แสดงภาพพื้นหลัง */}
                {img && <KonvaImage image={img} width={1080} height={560} />}

                {/* polygon */}
                <Line
                    points={polygon}
                    closed
                    fill="rgba(255,0,0,0.3)"
                    stroke="red"
                    strokeWidth={2}
                />
            </Layer>
        </Stage>
    );
};

export default PolygonCanvas;
