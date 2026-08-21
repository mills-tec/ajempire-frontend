'use client';

import { Bell, Loader2, X } from 'lucide-react';
import { useState } from 'react';

interface SendNotificationModalProps {
  recipientCount: number;
  recipientLabel: string; // e.g. "customer" or "admin"
  sending: boolean;
  onClose: () => void;
  onSend: (title: string, message: string) => void;
}

// Shared by the customers page (sends to customers via sendUserNotification)
// and the Roles & Access Control tab in admin settings (sends to admins via
// sendAdminNotification) — the two use different backend APIs, so this
// component only owns the title/message form state and hands the final
// values to whichever onSend the caller wires up. Owning that state itself
// (rather than the caller lifting it) also means typing here only
// re-renders this modal, not the page it's opened from.
export default function SendNotificationModal({
  recipientCount,
  recipientLabel,
  sending,
  onClose,
  onSend,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-brand_pink" />
            <span>Send Notification</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-brand_gray mb-4">
          This notification will be sent to all {recipientCount} {recipientLabel}{recipientCount !== 1 ? 's' : ''} at once.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Order Update"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification message..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(title, message)}
            disabled={sending || !title.trim() || !message.trim()}
            className="flex-1 px-4 py-2 bg-brand_pink hover:bg-brand_pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Notification'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
