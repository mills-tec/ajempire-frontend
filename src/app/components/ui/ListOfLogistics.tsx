import { getBearerToken } from "@/lib/api";
import axios from "axios";
import { useEffect, useState } from "react";
interface Courier {
    courier_id: string;
    courier_image: string;
    courier_name: string;
    delivery_eta: string;
    total: number;

}

export default function ListOfLogistics() {
    const [logistics, setLogistics] = useState<Courier[]>([]);
    const [selectedLogistic, setSelectedLogistic] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    console.log("Selected Logistic:", selectedLogistic);


    const getLogistics = async () => {
        setLoading(true);
        setHasFetched(true);
        const token = getBearerToken();

        if (!token) return;
        try {
            const res = await axios.get(
                "https://ajempire-backend.vercel.app/api/shippingRates",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (res?.data?.message) {
                console.log(res.data.message.couriers);
                setLogistics(res.data.message.couriers);
            }
        }
        catch (err) {
            console.error("Error fetching logistics:", err);
        }
        finally {
            setLoading(false);
        }
    };


    console.log("Logistics:", logistics);

    return (
        <div className="w-full flex flex-col gap-6 items-start">
            <button
                className="bg-primaryhover text-white p-2 font-medium text-[15px] rounded-md"
                onClick={getLogistics}
            >
                Get a Delivery Price
            </button>

            {loading && (
                <div className="w-full flex flex-col gap-6 mt-3" >
                    <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md" />
                    <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md" />
                    <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md" />
                    <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md" />
                </div>
            )}

            {!loading && hasFetched && logistics.length > 0 && (
                <>
                    <p className="text-[14px] font-medium">
                        Select a delivery option
                    </p>

                    {logistics.map((logistic) => (
                        <div
                            key={logistic.courier_id}
                            onClick={() => setSelectedLogistic(logistic.courier_id)}
                            className={`w-full border rounded-md flex items-center text-[14px] p-2 font-poppins font-extralight cursor-pointer
            ${selectedLogistic === logistic.courier_id
                                    ? "border-primaryhover"
                                    : "border-gray-200"
                                }`}>
                            <div className="w-[70%] flex items-center gap-1">
                                <img
                                    src={logistic.courier_image}
                                    alt=""
                                    className="w-[60px]"
                                />
                                <div>
                                    <p>{logistic.courier_name}</p>
                                    <p>{logistic.delivery_eta}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 w-[30%]">
                                <p className="font-medium">₦ {logistic.total}</p>

                                <input
                                    type="radio"
                                    name="logistic"
                                    value={logistic.courier_id}
                                    checked={selectedLogistic === logistic.courier_id}
                                    onChange={() =>
                                        setSelectedLogistic(logistic.courier_id)
                                    }
                                    className="w-[20px] accent-primaryhover"
                                />
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>

    );
}