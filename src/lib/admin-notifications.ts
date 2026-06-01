export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'return' | 'inventory' | 'system';
  createdAt: string;
  link?: string;
}

export function buildAdminNotifications(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  returns: any[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[] = []
): AdminNotification[] {
  const notifications: AdminNotification[] = [];
  const now = Date.now();

  orders
    .filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'pending')
    .slice(0, 5)
    .forEach((order) => {
      notifications.push({
        id: `order-${order._id || order.order_id}`,
        title: 'New order',
        message: `Order #${order.order_id || 'N/A'} from ${order.shippingAddress?.fullName || 'Customer'} — ₦${(order.totalPrice || 0).toLocaleString()}`,
        type: 'order',
        createdAt: order.createdAt || new Date(now).toISOString(),
        link: '/admin/orders',
      });
    });

  returns
    .filter((r) => r.status === 'pending')
    .slice(0, 3)
    .forEach((ret) => {
      notifications.push({
        id: `return-${ret._id}`,
        title: 'Return request',
        message: `Return #${ret._id?.slice(-6) || 'pending'} awaiting review`,
        type: 'return',
        createdAt: ret.createdAt || new Date(now).toISOString(),
        link: '/admin/returns',
      });
    });

  products
    .filter((p) => p.stock === 0 || (p.stock > 0 && p.stock <= 10))
    .slice(0, 3)
    .forEach((product) => {
      notifications.push({
        id: `inventory-${product._id}`,
        title: product.stock === 0 ? 'Out of stock' : 'Low stock',
        message: `${product.name} — ${product.stock} units remaining`,
        type: 'inventory',
        createdAt: product.updatedAt || new Date(now).toISOString(),
        link: '/admin/inventory',
      });
    });

  return notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
}
