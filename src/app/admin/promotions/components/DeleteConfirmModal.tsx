'use client'

import { AlertCircle, Loader2, X } from 'lucide-react';
import React, { memo } from 'react';
import ModalShell from './ModalShell';

interface DeleteConfirmModalProps {
  promotionTitle?: string;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({
  promotionTitle,
  deleting,
  error,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => {
  return (
    <ModalShell onClose={onClose} panelClassName="max-w-md" ariaLabel="Delete promotion">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <span>Delete Promotion</span>
        </h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-6 space-y-2">
        <p className="text-sm text-brand_gray">Are you sure you want to delete this promotion?</p>
        <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">
          This action is permanent, cannot be undone, and will immediately deactivate and delete
          the promotion &quot;{promotionTitle || 'Untitled promotion'}&quot;.
        </p>
        {error && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={deleting}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete Promotion'
          )}
        </button>
      </div>
    </ModalShell>
  );
};

export default memo(DeleteConfirmModal);
