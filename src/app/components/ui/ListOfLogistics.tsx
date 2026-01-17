import { getBearerToken } from "@/lib/api";
import axios from "axios";
import { useEffect, useState } from "react";
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

    const { selectedLogistic, setSelectedLogistic } = useCartStore();
    // console.log("Selected Logistic:", selectedLogistic);

    useEffect(() => {
        fetchLogistics();
    }, []);

    const fetchLogistics = async () => {
        setLoading(true);
        const token = getBearerToken();
        if (!token) return;

        try {
            const res = await axios.get(
                "https://ajempire-backend.vercel.app/api/shippingRates",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data?.message) {
                console.log("Logistics fetched:", res.data?.message);
                setLogistics(res.data?.message?.couriers);
                useCartStore.getState().setRequestToken(res.data?.message?.request_token);
                console.log("Request Token:", res.data?.message?.couriers, res.data?.message?.request_token);
            }
        } catch (err) {
            console.error("Error fetching logistics", err);
        } finally {
            setLoading(false);
        }
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
                                <p className="font-medium">₦{logistic.total}</p>
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
