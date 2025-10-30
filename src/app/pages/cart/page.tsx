"use client";
import axios from "axios";
import { useEffect } from "react";

export default function CartPage() {
    useEffect(() => {
        const initaiteCart = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await axios.post(
                    "https://ajempire-backend.vercel.app/api/cart",
                    {
                        items: [
                            {
                                productId: "68f0d8780c4f1d79d009f95e",
                                qty: 2,
                            },
                        ],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("Cart response:", response.data);
            } catch (error) {
                console.error("Error adding to cart:", error);
            }
        }
        initaiteCart();
    }, []);
    return <div>CART PAGE</div>
}
