import { getBearerToken, getShippingRates } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart-store";

interface Courier {
  courier_id: string;
  courier_image: string;
  courier_name: string;
  delivery_eta: string;
  total: number;
}

export default function ListOfLogistics() {
  const [logistics, setLogistics] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(false);

  const { items, getSelectedItems, selectedLogistic, setSelectedLogistic } =
    useCartStore();
  console.log("Selected Logistic:", selectedLogistic);

  useEffect(() => {
    fetchLogistics();
  }, [items]);

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

    // Convert cart items into the package item structure expected by shipping API
    const packageItems = selectedItems.map((item) => ({
      name: item.name || "Unknown Product",
      description: item.description || item.name || "No description",
      // weight: (item as any).weight || 1, // Note: weight not available in Product interface
      amount: item.price || 0,
      quantity: item.quantity || 1,
    }));

    console.log("Shipping payload packageItems:", packageItems);

    setLoading(true);
    try {
      const response = await getShippingRates(packageItems);
      console.log("🔥 RAW API RESPONSE:", response);

      if (response?.message) {
        console.log("Logistics fetched inside message:", response?.message);
        setLogistics(response?.message?.couriers);
        useCartStore
          .getState()
          .setRequestToken(response?.message?.request_token);
        console.log(
          "Request Token:",
          response?.message?.couriers,
          response?.message?.request_token,
        );
      } else {
        console.log("⚠️ No 'message' property found in the response.");
      }
    } catch (err: any) {
      const apiMessage = err?.message || "Unknown error";
      console.error("🔥 Error fetching logistics API", apiMessage, err);
      toast.error(`Logistics API failure: ${apiMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  console.log("Logistics State:", logistics);
  return (
    <div className="flex flex-col gap-4">
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
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
                <img src={logistic.courier_image} className="w-[50px]" />
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
