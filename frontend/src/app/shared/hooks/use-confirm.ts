import { signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export function useConfirmDialog() {
  const isOpen = signal(false);
  const isLoading = signal(false);
  const options = signal<ConfirmOptions>({
    title: 'ยืนยันการทำรายการ',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    type: 'danger'
  });

  let resolveHandler: ((value: boolean) => void) | null = null;

  const ask = (opts?: ConfirmOptions): Promise<boolean> => {
    if (opts) {
      options.set({ ...options(), ...opts });
    }
    isOpen.set(true);
    isLoading.set(false);

    return new Promise<boolean>((resolve) => {
      resolveHandler = resolve;
    });
  };

  const onConfirm = () => {
    isOpen.set(false);
    if (resolveHandler) resolveHandler(true);
  };

  const onCancel = () => {
    isOpen.set(false);
    if (resolveHandler) resolveHandler(false);
  };

  return {
    isOpen,
    isLoading,
    options,
    ask,
    onConfirm,
    onCancel
  };
}
