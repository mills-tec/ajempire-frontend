// Local shape Header.tsx's notification dropdown renders — normalized from
// AdminNotificationRecord (src/lib/admin-types.ts), the real notification
// fetched/streamed by AdminNotificationWrapper.
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  link?: string;
  readBy?: { adminId: string }[];
}
