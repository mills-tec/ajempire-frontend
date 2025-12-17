"use client";
import { useState } from "react";
import { deleteData, getData, postData, updateData } from "./api";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { IOrder, Review } from "@/lib/types";
import { getBearerToken } from "@/lib/api";
let config = {};

const token = typeof window !== "undefined" ? localStorage.getItem('user') : null;
if (token) {
  config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
export const useOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const getAllOrders = async () => {
    setIsLoading(true);
    try {
      console.log("config", config);
      let req = await getData("/orders/", config);
      console.log(req)
      const orderRequest = req.data.message;
      req = await getData("/review/", config);
      const reviews: Review[] = req.data.message;
      const orders = orderRequest.map((order: IOrder) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          review: reviews.find((review) => review.product == item.product),
        })),
      }));
      return orders;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrder = async (id: string) => {
    setIsLoading(true);
    try {
      const req = await getData(`/orders/${id}`, config);
      const resp = req.data;
      return resp;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addOrderToCart = async (
    data: {
      productId: string;
      qty: number;
      variant?: string;
    }[]
  ) => {
    setPostLoading(true);
    try {
      const req = await postData(`/cart/`, { items: data }, config);
      const resp = req.data;
      return resp;
    } catch (err) {
      console.error(err);
    } finally {
      setPostLoading(false);
    }
  };

  return { getAllOrders, getOrder, addOrderToCart, isLoading, postLoading };
};

export const useReviews = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const postReview = async ({
    data,
    product,
  }: {
    data: { rating: number; comment?: string };
    product: string;
  }) => {
    if (!loading) {
      setLoading(true);
      try {
        await postData(`/review/${product}`, data, config);
        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast(message, { type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const getUserReviews = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData("/review/", config);
        return req.data.message;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast(message, { type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const updateReview = async ({
    data,
    product,
  }: {
    data: { rating: number; comment?: string };
    product: string;
  }) => {
    if (!loading) {
      setLoading(true);
      try {
        await updateData(`/review/${product}`, data, config);
        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast(message, { type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteReview = async (product: string) => {
    if (!loading) {
      setLoading(true);
      try {
        await deleteData(`/review/${product}`, config);
        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
          console.log(err.response);
        } else {
          message = "Something went wrong.";
        }
        toast(message, { type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  return { postReview, getUserReviews, updateReview, deleteReview, loading };
};
