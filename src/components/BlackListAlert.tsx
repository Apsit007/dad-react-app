import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import type { FC } from "react";

type VehicleInfo = {
  plate: string;
  province?: string;
  brand?: string;
  color?: string;
  imageUrl?: string;
};

type PersonInfo = {
  fullName: string;
  agency?: string; // สังกัด
  imageUrl?: string;
};

type BlackListAlertProps = {
  open: boolean;
  onClose: () => void;
  typeText?: string; // ประเภท : ขาเข้า
  dateTimeText?: string; // 10/10/2568 10:00:10
  vehicle: VehicleInfo;
  person: PersonInfo;
};

const FallbackImage = ({ alt }: { alt: string }) => (
  <div className="w-full h-[240px] bg-gray-200 flex items-center justify-center text-gray-500">
    <Typography variant="body2">{alt}</Typography>
  </div>
);

const SectionHeader = ({ left, right }: { left: string; right: string }) => (
  <div className="flex items-center justify-between ">
    <Typography variant="h6" className="text-primary !font-semibold">
      {left}
    </Typography>
    <Typography variant="h6" className="text-primary !font-semibold">
      {right}
    </Typography>
  </div>
);

const CardWithImage = ({
  title,
  subTitle,
  imageUrl,
}: {
  title: string; // ribbon text (Blacklist)
  subTitle: string; // plate or person name
  imageUrl?: string;
}) => (
  <div className="rounded-md overflow-hidden  ">
    <div className="relative">
      {/* Ribbon */}
      <div className=" left-0 top-0 z-10 flex">
        <div className="bg-[#9F0C0C] text-white px-3 py-1 rounded-br-md shadow">{title}</div>
        <div className="bg-white/95 text-primary px-3 py-1 border-l border-red-300 rounded-br-md shadow">
          <Typography variant="subtitle2" className="!font-semibold">
            {subTitle}
          </Typography>
        </div>
      </div>

      <div className="border border-red-300">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={subTitle}
            className="w-full h-[240px] object-cover"
          />
        ) : (
          <FallbackImage alt={subTitle} />
        )}
      </div>
    </div>
  </div>
);



const BlackListAlert: FC<BlackListAlertProps> = ({
  open,
  onClose,
  typeText = "ประเภท : ขาเข้า",
  dateTimeText = "10/10/2568 10:00:10",
  vehicle,
  person,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" className="text-[#9F0C0C] !font-bold">
          Blacklist
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CancelOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Header line under title */}
        <div className=" border-gray-300 pt-3">
          <SectionHeader left={typeText} right={dateTimeText} />

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle column */}
            <div>
              <CardWithImage
                title="Blacklist"
                subTitle={`${vehicle.plate}${vehicle.province ? ` ${vehicle.province}` : ""}`}
                imageUrl={vehicle.imageUrl}
              />
              <div className="mt-2 ">
                <div className="flex flex-row h-[100px]">
                  <div className="bg-primary w-1/4 text-white flex  items-center ps-4  border-t ">
                    <Typography variant="h6" className="!font-semibold">
                      ยี่ห้อ
                    </Typography>
                  </div>
                  <div className="bg-[#C5C8CB] w-3/4  border-gray-200 ps-4 items-center flex text-primary">
                    <Typography variant="h6">Hyundai</Typography>
                  </div>
                </div>
                <div className="flex flex-row h-[100px]">
                  <div className="bg-primary w-1/4 text-white  border-t ps-4  items-center flex">
                    <Typography variant="h6" className="!font-semibold">
                      สี
                    </Typography>
                  </div>
                  <div className="bg-[#C5C8CB] w-3/4  border-t    border-gray-200 ps-4 items-center flex text-primary ">
                    <Typography variant="h6">ขาว</Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Person column */}
            <div>
              <CardWithImage
                title="Blacklist"
                subTitle={person.fullName}
                imageUrl={person.imageUrl}
              />
              <div className="mt-2">
                <div className="flex flex-row h-[200px]">
                  <div className="bg-primary w-1/4 text-white  border-t ps-4 border-primary-dark items-center flex">
                    <Typography variant="h6" className="!font-semibold">
                      สังกัด
                    </Typography>
                  </div>
                  <div className="bg-[#C5C8CB] w-3/4  border-gray-200 ps-4 items-center  flex text-primary">
                    <Typography variant="h6">สำนักงานกิจการยุติธรรม กระทรวงยุติธรรม</Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlackListAlert;

