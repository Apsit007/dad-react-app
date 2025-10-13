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
  member: PersonInfo;
  lpr: PersonInfo;
  department: string;
  alertTitle: any
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
  typeTitle,
  title,
  imageUrl,
}: {
  typeTitle: string;
  title: string; // ribbon text (Blacklist)
  imageUrl?: string;
}) => {
  // ✅ Map title → gradient class
  const getBgClass = (title: string) => {
    switch (title) {
      case "Watchlist":
        return "bg-gradient-to-tr from-[#E29578] to-[#ebbbaa]";
      case "VIP":
        return "bg-gradient-to-tr from-[#FFC300] to-[#ffdd62]";
      case "Blacklist":
        return "bg-[#9F0C0C]";
      default:
        return "bg-gray-500"; // fallback
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
      default:
        return ""; // fallback
    }
  };

  return (
    <div className="rounded-md overflow-hidden  ">
      <div className="relative">
        {/* Ribbon */}
        <div className=" left-0 top-0 z-10 flex">
          <div
            className={`${getBgClass(title)} text-white px-3 py-1  shadow w-full`}
          >
            <Typography variant="subtitle1" className="!font-semibold">
              {typeTitle}  : {title} ({getThText(title)})
            </Typography>

          </div>

        </div>

        <div className="border border-red-300 bg-black flex h-[371px] justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-auto h-full object-cover"
            />
          ) : (
            <FallbackImage alt={title} />
          )}
        </div>
      </div>
    </div>
  )

}



const BlackListAlert: FC<BlackListAlertProps> = ({
  open,
  onClose,
  typeText = "ประเภท : ขาเข้า",
  dateTimeText = "10/10/2568 10:00:10",
  vehicle,
  member,
  lpr,
  alertTitle,
  department
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" className="text-primary !font-bold">
          แจ้งเตือน
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CancelOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Header line under title */}
        <div className=" border-gray-300 pt-3">
          <SectionHeader left={typeText} right={dateTimeText} />

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vehicle column */}
            <div>
              <CardWithImage
                typeTitle='รถ'
                title={alertTitle.vehecleTitle}
                imageUrl={vehicle.imageUrl}

              />
              <div className="mt-2 h-[200px]">
                <div className="w-full bg-primary  text-center">
                  <Typography variant="h6" className="!font-semibold !text-white">
                    เลขทะเบียน
                  </Typography>
                </div>
                <div className=" w-full text-primary  border-[1px] ps-4 border-primary-dark items-center justify-center flex flex-row">
                  <Typography variant="h6" className="!font-semibold">
                    {vehicle.plate}
                  </Typography>
                  <Typography variant="h6" className="!font-semibold">
                    {vehicle.province}
                  </Typography>
                </div>

              </div>
            </div>
            {/* Person Lpr column */}
            <div>
              <CardWithImage
                typeTitle='บุคคลที่ตรวจจับ'
                title={alertTitle.lprTitle}
                imageUrl={lpr.imageUrl}
              />
              <div className="mt-2">
                <div className="w-full bg-primary text-center">
                  <Typography variant="h6" className="!font-semibold !text-white">
                    ชื่อ-นามสกุล
                  </Typography>
                </div>
                <div className=" w-full text-primary  border-[1px] ps-4 border-primary-dark items-center justify-center flex">
                  <Typography variant="h6" className="!font-semibold">
                    {lpr.fullName}
                  </Typography>

                </div>
              </div>
            </div>

            {/* Person Member column */}
            <div>
              <CardWithImage
                typeTitle='บุคคลที่ลงทะเบียน'
                title={alertTitle.memberTitle}
                imageUrl={member.imageUrl}
              />
              <div className="mt-2">
                <div className="w-full bg-primary text-center">
                  <Typography variant="h6" className="!font-semibold !text-white">
                    ชื่อ-นามสกุล
                  </Typography>
                </div>
                <div className=" w-full text-primary  border-[1px] ps-4 border-primary-dark items-center justify-center flex">
                  <Typography variant="h6" className="!font-semibold">
                    {member.fullName}
                  </Typography>

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

