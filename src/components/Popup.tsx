// src/components/Popup.tsx
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { ReactNode } from 'react';

// Define the props for our component
interface PopupProps {
    title: string;
    show: boolean;
    onClose: () => void;
    children: ReactNode; // To render content inside the popup
}

const Popup = ({ title, show, onClose, children }: PopupProps) => {
    return (
        // The Dialog component is controlled by the `open` prop
        <Dialog
            open={show}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
        >
            {/* DialogTitle acts as the header */}
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {title}
                <IconButton onClick={onClose} aria-label="close">
                    <CancelOutlinedIcon />
                </IconButton>
            </DialogTitle>

            {/* DialogContent is the body where your content will go */}
            <DialogContent dividers>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default Popup;