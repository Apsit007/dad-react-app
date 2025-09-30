import { Avatar, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react"
import ImageViewer from "./ImageViewer";

type ImageTagProps = {
    type?: 'car' | 'person' | null
    tag: 'visitor' | 'member' | 'blacklist' | null
    img: string;
}

const bgcolor: Record<string, string> = {
    visitor: '#6EA7E1',
    member: '#EA8810',
    blacklist: '#9F0C0C',
    none: '#9E9E9E'
}

const ImageTag = ({ tag, img }: ImageTagProps) => {
    const [openImageViewer, setOpenImageViewer] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState<string>(bgcolor.none);
    const [viewImgUrl, setViewImgUrl] = useState<string>('')


    useEffect(() => {
        setBackgroundColor(tag ? bgcolor[tag] ?? bgcolor.none : bgcolor.none);
    }, [tag]);

    useEffect(() => {

    }, [viewImgUrl])

    const viewImg = useCallback((img: string) => {
        setOpenImageViewer(true);
        setViewImgUrl(img)
    }, [viewImgUrl])

    return (
        <>
            <div
                className={`px-1 py-1 rounded text-white text-sm font-semibold h-full w-1/2 text-center cursor-pointer`}
                style={{ backgroundColor }}
                onClick={() => viewImg(img)}
            >     <Avatar variant="square" src={img} className="!w-full !h-3/4" />
                <Typography variant="caption">
                    {tag ?? '-'}
                </Typography>
            </div>
            <ImageViewer
                open={openImageViewer}
                imgUrl={viewImgUrl}
                onClose={() => setOpenImageViewer(false)}
            />
        </>
    );
}

export default ImageTag;
