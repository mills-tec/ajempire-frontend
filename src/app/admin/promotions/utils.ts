import { Promotion, PromotionFormValues, PromotionPayload, PromotionStats } from './types';

export const EMPTY_FORM_VALUES: PromotionFormValues = {
  title: '',
  description: '',
  promotionType: 'flashsale',
  discountType: 'percent',
  discountValue: '',
  applyTo: 'product',
  applyToId: [],
  banner: '',
  startDate: '',
  endDate: '',
  couponCode: '',
};

export const getEntityId = (entity: { _id?: string; id?: string }): string =>
  entity._id || entity.id || '';

/**
 * The API is inconsistent about where it puts list payloads
 * (`message`, `data`, the raw response, or nested under a key like
 * `message.products`). Normalizes all of those to a plain array.
 */
export function extractList<T>(response: unknown, nestedKey?: string): T[] {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== 'object') return [];

  const record = response as Record<string, unknown>;
  for (const candidate of [record.message, record.data]) {
    if (Array.isArray(candidate)) return candidate as T[];
    if (nestedKey && candidate && typeof candidate === 'object') {
      const nested = (candidate as Record<string, unknown>)[nestedKey];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
}

export interface PaginatedList<T> {
  items: T[];
  /** Total item count across all pages, when the API reports it. */
  totalItems: number | null;
  /** Total page count, when the API reports it. */
  totalPages: number | null;
}

const readNumber = (source: unknown, keys: string[]): number | null => {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
};

const TOTAL_ITEM_KEYS = ['total', 'totalItems', 'totalDocuments', 'totalCount', 'count'];
const TOTAL_PAGE_KEYS = ['totalPages', 'pageCount', 'pages'];

/**
 * Like extractList, but also pulls pagination metadata when the API sends it
 * (either alongside the list or under a `pagination` object, e.g.
 * `{ message: { items: [...], pagination: { total, totalPages } } }`).
 */
export function extractPaginatedList<T>(response: unknown): PaginatedList<T> {
  if (Array.isArray(response)) {
    return { items: response as T[], totalItems: null, totalPages: null };
  }
  if (!response || typeof response !== 'object') {
    return { items: [], totalItems: null, totalPages: null };
  }

  const record = response as Record<string, unknown>;
  for (const container of [record.message, record.data]) {
    if (Array.isArray(container)) {
      const meta = (record.pagination as unknown) ?? record;
      return {
        items: container as T[],
        totalItems: readNumber(meta, TOTAL_ITEM_KEYS),
        totalPages: readNumber(meta, TOTAL_PAGE_KEYS),
      };
    }
    if (container && typeof container === 'object') {
      const inner = container as Record<string, unknown>;
      const items = inner.items ?? inner.promotions;
      if (Array.isArray(items)) {
        const meta = (inner.pagination as unknown) ?? inner;
        return {
          items: items as T[],
          totalItems: readNumber(meta, TOTAL_ITEM_KEYS),
          totalPages: readNumber(meta, TOTAL_PAGE_KEYS),
        };
      }
    }
  }
  return { items: [], totalItems: null, totalPages: null };
}

export const toDateInputValue = (date?: string): string =>
  date ? new Date(date).toISOString().split('T')[0] : '';

export function toFormValues(promotion: Promotion): PromotionFormValues {
  return {
    title: promotion.title || '',
    description: promotion.description || '',
    promotionType: promotion.promotionType === 'coupon' ? 'coupon' : 'flashsale',
    discountType: promotion.discountType === 'fixed' ? 'fixed' : 'percent',
    discountValue: promotion.discountValue != null ? String(promotion.discountValue) : '',
    applyTo:
      promotion.applyTo === 'category' || promotion.applyTo === 'all'
        ? promotion.applyTo
        : 'product',
    applyToId: promotion.applyToId || [],
    banner: promotion.banner || '',
    startDate: toDateInputValue(promotion.startDate),
    endDate: toDateInputValue(promotion.endDate),
    couponCode: promotion.couponCode || '',
  };
}

/**
 * Builds the JSON body for createPromotion/updatePromotion. `bannerKey` is
 * whatever should be sent for the banner field — the object key from a
 * freshly-uploaded file, the existing banner URL if it wasn't changed, or an
 * empty string to clear it. The raw File itself never passes through here;
 * uploading it to storage happens separately, before this is called.
 */
export function buildPromotionPayload(
  values: PromotionFormValues,
  bannerKey: string,
): PromotionPayload {
  const payload: PromotionPayload = {
    title: values.title.trim(),
    description: values.description.trim(),
    promotionType: values.promotionType,
    discountType: values.discountType,
    discountValue: Number(values.discountValue) || 0,
    applyTo: values.applyTo,
    applyToId: values.applyToId,
    // Coupon codes only make sense for coupon promotions; sending an empty
    // value tells the API to clear any previously saved code.
    couponCode: values.promotionType === 'coupon' && values.couponCode.trim() ? values.couponCode.trim() : '',
  };

  if (bannerKey) {
    payload.banner = bannerKey;
  }
  if (values.startDate) {
    payload.startDate = new Date(values.startDate).toISOString();
  }
  if (values.endDate) {
    payload.endDate = new Date(values.endDate).toISOString();
  }

  return payload;
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-green-50 text-green-500 border-green-100',
  Scheduled: 'bg-blue-50 text-blue-500 border-blue-100',
  Completed: 'bg-gray-50 text-gray-500 border-gray-100',
  Paused: 'bg-yellow-50 text-yellow-500 border-yellow-100',
};

export const getStatusStyle = (status?: string): string =>
  STATUS_STYLES[status ?? ''] ?? 'bg-gray-50 text-gray-500 border-gray-100';

export function formatDiscount(
  promotion: Pick<Promotion, 'discountType' | 'discountValue'>,
): string {
  const value = promotion.discountValue ?? 0;
  if (promotion.discountType === 'percent') return `${value}% OFF`;
  if (promotion.discountType === 'fixed') return `₦${value.toLocaleString()} OFF`;
  return promotion.discountType || 'N/A';
}

type EffectiveStatus = 'active' | 'upcoming' | 'expired';

function resolveStatus(promotion: Promotion, now: Date): EffectiveStatus {
  const status = promotion.status?.toLowerCase();
  const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
  const endDate = promotion.endDate ? new Date(promotion.endDate) : null;

  if (status === 'expired' || (endDate && endDate < now)) return 'expired';
  if (status === 'active' || (startDate && startDate <= now && endDate && endDate >= now)) {
    return 'active';
  }
  if (status === 'scheduled' || (startDate && startDate > now)) return 'upcoming';
  return 'active';
}

export function computePromotionStats(promotions: Promotion[]): PromotionStats {
  const now = new Date();
  const stats: PromotionStats = {
    active: 0,
    upcoming: 0,
    expired: 0,
    totalPercentDiscount: 0,
    totalFixedDiscount: 0,
  };

  promotions.forEach((promotion) => {
    const status = resolveStatus(promotion, now);
    if (status === 'expired') {
      stats.expired++;
    } else if (status === 'upcoming') {
      stats.upcoming++;
    } else {
      stats.active++;
      if (promotion.discountValue) {
        if (promotion.discountType === 'percent') {
          stats.totalPercentDiscount += promotion.discountValue;
        } else {
          stats.totalFixedDiscount += promotion.discountValue;
        }
      }
    }
  });

  return stats;
}
