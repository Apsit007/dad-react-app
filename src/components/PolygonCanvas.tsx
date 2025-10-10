// src/components/PolygonCanvas.tsx
import React, { useEffect, useState } from "react";
import { Stage, Layer, Line, Image as KonvaImage, Circle } from "react-konva";

interface PolygonCanvasProps {
    imageUrl: string;
    polygon: number[]; // พิกัดจริง (1920x1080)
    setPolygon: (points: number[]) => void;
    drawing?: boolean;
}

const PolygonCanvas: React.FC<PolygonCanvasProps> = ({
    imageUrl,
    polygon,
    setPolygon,
    drawing,
}) => {
    const displayWidth = 1080;
    const displayHeight = 560;
    const imageWidth = 1920;
    const imageHeight = 1080;

    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [isClosed, setIsClosed] = useState(false);

    // อัตราส่วนการย่อภาพ
    const scaleX = displayWidth / imageWidth;
    const scaleY = displayHeight / imageHeight;

    // โหลดรูป
    useEffect(() => {
        const image = new window.Image();
        image.src = imageUrl;
        image.onload = () => setImg(image);
    }, [imageUrl]);

    // ฟังก์ชันคำนวณระยะ (ในพิกัดจริง)
    const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const handleClick = (e: any) => {
        if (!drawing || isClosed) return;

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const { x, y } = pointer;

        // ✅ แปลงกลับเป็นพิกัดจริงของภาพ
        const realX = x / scaleX;
        const realY = y / scaleY;

        if (polygon.length >= 2) {
            const [startX, startY] = polygon;
            const distance = getDistance(startX, startY, realX, realY);

            if (distance < 10) {
                // ปิด polygon
                setPolygon([...polygon, startX, startY]);
                setIsClosed(true);
                return;
            }
        }

        // เพิ่มจุดใหม่ (พิกัดจริง)
        setPolygon([...polygon, realX, realY]);
    };

    // ✅ แปลงพิกัดจริงเป็นพิกัดจอเพื่อแสดงผล
    const displayPoints = polygon.map((p, i) =>
        i % 2 === 0 ? p * scaleX : p * scaleY
    );

    return (
        <Stage width={displayWidth} height={displayHeight} onClick={handleClick}>
            <Layer>
                {/* แสดงภาพพื้นหลัง */}
                {img && <KonvaImage image={img} width={displayWidth} height={displayHeight} />}

                {/* polygon */}
                <Line
                    points={displayPoints}
                    closed={isClosed}
                    fill={isClosed ? "rgba(255,0,0,0.3)" : undefined}
                    stroke="red"
                    strokeWidth={2}
                />

                {/* จุดเริ่มต้น */}
                {displayPoints.length >= 2 && (
                    <Circle
                        x={displayPoints[0]}
                        y={displayPoints[1]}
                        radius={5}
                        fill="yellow"
                        stroke="black"
                        strokeWidth={1}
                    />
                )}

                {/* แสดงจุดทั้งหมด */}
                {displayPoints.length >= 2 &&
                    Array.from({ length: displayPoints.length / 2 }, (_, i) => (
                        <Circle
                            key={i}
                            x={displayPoints[i * 2]}
                            y={displayPoints[i * 2 + 1]}
                            radius={3}
                            fill="red"
                        />
                    ))}
            </Layer>
        </Stage>
    );
};

export default PolygonCanvas;
