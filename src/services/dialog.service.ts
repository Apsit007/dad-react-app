// src/service/dialog.service.ts
// Centralized SweetAlert2 dialog helpers for use across the project.

import Swal, { type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2';

// Default options applied to all dialogs; can be overridden per call
const baseOptions: SweetAlertOptions = {
  confirmButtonText: 'ตกลง',
  cancelButtonText: 'ยกเลิก',
  buttonsStyling: true,
};

const fire = (opts: SweetAlertOptions) => Swal.fire({ ...baseOptions, ...opts });

const success = (text: string, title = 'สำเร็จ', options?: SweetAlertOptions) =>
  fire({ icon: 'success', title, text, ...options });

const error = (text: string, title = 'ผิดพลาด', options?: SweetAlertOptions) =>
  fire({ icon: 'error', title, text, ...options });

const warning = (text: string, title = 'คำเตือน', options?: SweetAlertOptions) =>
  fire({ icon: 'warning', title, text, ...options });

const info = (text: string, title = 'แจ้งเตือน', options?: SweetAlertOptions) =>
  fire({ icon: 'info', title, text, ...options });

type ConfirmOptions = SweetAlertOptions & {
  confirmText?: string;
  cancelText?: string;
};

// Returns a boolean that resolves true when confirmed.
const confirm = async (
  text: string,
  title = 'ยืนยันการทำรายการ',
  options?: ConfirmOptions,
): Promise<boolean> => {
  const { confirmText, cancelText, ...rest } = options ?? {};
  const result: SweetAlertResult = await fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText ?? baseOptions.confirmButtonText,
    cancelButtonText: cancelText ?? baseOptions.cancelButtonText,
    ...rest,
  });
  return Boolean(result.isConfirmed);
};

// Show blocking loading indicator. Call close() to dismiss.
const loading = (message = 'กำลังดำเนินการ...') =>
  fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

const close = () => Swal.close();

const dialog = { success, error, warning, info, confirm, loading, close };

export type { ConfirmOptions };
export { success, error, warning, info, confirm, loading, close };
export default dialog;

