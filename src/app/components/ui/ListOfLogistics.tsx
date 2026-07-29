import { getBearerToken, getShippingRates } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Courier {
  courier_id: string;
  courier_image: string;
  courier_name: string;
  delivery_eta: string;
  delivery_eta_time?: string;
  total: number;
}

const LOADING_SKELETON_ROWS = 4;

export default function ListOfLogistics() {
  const [logistics, setLogistics] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(false);

  // Selector-scoped subscriptions — a whole-store destructure here re-rendered
  // this list on every cart-store mutation anywhere in the checkout flow
  // (coupon applied, checkout step changing, an unrelated debounced sync
  // completing), not just the ones that actually affect it.
  const items = useCartStore((s) => s.items);
  const getSelectedItems = useCartStore((s) => s.getSelectedItems);
  const selectedLogistic = useCartStore((s) => s.selectedLogistic);
  const setSelectedLogistic = useCartStore((s) => s.setSelectedLogistic);
  const clearSelectedLogistic = useCartStore((s) => s.clearSelectedLogistic);

  useEffect(() => {
    // Guards against out-of-order responses: `items` changing quickly (e.g.
    // toggling several checkboxes in a row) can start more than one fetch
    // before the first resolves. Without this, a slower, older response
    // could resolve after a newer one and overwrite it with stale rates.
    let cancelled = false;

    const fetchLogistics = async () => {
      const token = getBearerToken();
      if (!token) {
        console.error("No token found. Make sure you are logged in.");
        setLoading(false);
        return;
      }

      const selectedItems = getSelectedItems();
      if (!selectedItems || selectedItems.length === 0) {
        console.warn(
          "No selected items available for shipping rate calculation.",
        );
        setLoading(false);
        setLogistics([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getShippingRates();
        if (cancelled) return;

        if (response?.status) {
          const couriers = response.message?.couriers ?? [];
          setLogistics(couriers);
          useCartStore
            .getState()
            .setRequestToken(response.message?.request_token ?? "");

          // Pricing/ETA can shift when the cart changes, so a previously
          // selected courier must be refreshed against the new rates (or
          // cleared if it's no longer offered) rather than silently
          // carrying forward a stale price into the order total.
          const currentSelection = useCartStore.getState().selectedLogistic;
          if (currentSelection) {
            const stillOffered = couriers.find(
              (c) => c.courier_id === currentSelection.courier_id,
            );
            if (stillOffered) {
              setSelectedLogistic(stillOffered);
            } else {
              clearSelectedLogistic();
            }
          }
        } else {
          console.warn("Shipping rates request did not return a successful status.");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const apiMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching logistics API:", apiMessage, err);
        toast.error(`Logistics API failure: ${apiMessage}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogistics();

    return () => {
      cancelled = true;
    };
    // getSelectedItems/setSelectedLogistic/clearSelectedLogistic are stable
    // zustand actions — listed for correctness, not because they ever
    // actually change and cause a re-run.
  }, [items, getSelectedItems, setSelectedLogistic, clearSelectedLogistic]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  return (
    <div className="flex flex-col gap-4">
      {loading &&
        Array.from({ length: LOADING_SKELETON_ROWS }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-md" />
        ))}

      {!loading &&
        logistics?.map((logistic) => {
          const isSelected =
            selectedLogistic?.courier_id === logistic.courier_id;

          return (
            <div
              key={logistic.courier_id}
              onClick={() => setSelectedLogistic(logistic)}
              className={`border rounded-md p-3 cursor-pointer flex items-center justify-between
                ${isSelected ? "border-primaryhover" : "border-gray-200"}
              `}
            >
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logistic.courier_image} alt={logistic.courier_name} className="w-[50px]" />
                <div>
                  <p>{logistic.courier_name}</p>
                  <p className="text-[12px] text-gray-500">
                    {logistic.delivery_eta}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="font-medium">₦{formatPrice(logistic.total)}</p>
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  className="accent-primaryhover"
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
