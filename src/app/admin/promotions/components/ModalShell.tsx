'use client'

import React, { useEffect } from 'react';

interface ModalShellProps {
  onClose: () => void;
  /** Close when the dark backdrop is clicked. Off by default so forms can't be dismissed accidentally. */
  closeOnBackdrop?: boolean;
  panelClassName?: string;
  ariaLabel: string;
  children: React.ReactNode;
}

const ModalShell = ({
  onClose,
  closeOnBackdrop = false,
  panelClassName = 'max-w-2xl',
  ariaLabel,
  children,
}: ModalShellProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl p-6 w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
