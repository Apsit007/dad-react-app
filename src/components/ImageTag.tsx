import { Avatar, Typography } from "@mui/material";
import { useEffect, useState } from "react"

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
    const [backgroundColor, setBackgroundColor] = useState<string>(bgcolor.none);

    useEffect(() => {
        setBackgroundColor(tag ? bgcolor[tag] ?? bgcolor.none : bgcolor.none);
    }, [tag]);

    return (
        <div
            className={`px-1 py-1 rounded text-white text-sm font-semibold h-full w-1/2 text-center `}
            style={{ backgroundColor }}
        >     <Avatar variant="square" src={img} className="!w-full !h-3/4" />
            <Typography variant="caption">
                {tag ?? '-'}
            </Typography>
        </div>
    );
}

export default ImageTag;
