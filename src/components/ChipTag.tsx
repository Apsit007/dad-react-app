import { Typography } from "@mui/material";

type ChipTagProps = {
    tag: 'Visitor' | 'Member' | 'Blacklist' | 'VIP' | null
}

const bgClass: Record<string, string> = {
    Visitor: "bg-gradient-to-tr from-[#6EA7E1] to-[#90bef3]",
    Member: "bg-gradient-to-tr from-[#EA8810] to-[#FFB84D]",
    Blacklist: "bg-gradient-to-tr from-[#9F0C0C] to-[#cf4432]",
    VIP: "bg-gradient-to-tr from-[#FFC300] to-[#ffdd62]",
    none: "bg-gradient-to-tr from-[#9E9E9E] to-[#BDBDBD]"
}

const ChipTag = ({ tag }: ChipTagProps) => {
    const bg = bgClass[tag ?? "none"];

    return (
        <div
            className={`w-[80px] h-[40px] rounded-tl-md rounded-br-md flex justify-center items-center shadow-md border-b-[1px] border-r-[1px] border-gray-300 ${bg}`}
        >
            <Typography variant="body2" color="white">
                {tag ?? '-'}
            </Typography>
        </div>
    )
}

export default ChipTag;
