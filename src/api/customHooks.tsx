"use client";
import { useState } from "react";
import { deleteData, getData, postData, updateData } from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { getBearerToken } from "@/lib/api";
import { ITEMS_TO_APPEND } from "@/lib/utils";

let config = {};
const token = getBearerToken();
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

  const getAllOrders = async () => {
    setIsLoading(true);
    try {
      const req = await getData("/orders/", config);
      const orderRequest = req.data.message;

      return orderRequest;
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
    }[],
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
        const req = await postData(`/review/${product}`, data, config);
        toast.success("Review submitted successfully");
        return req.data;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        console.log(err);
        toast.error(message);
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
        toast.error(message);
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
        toast.error(message);
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
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  return { postReview, getUserReviews, updateReview, deleteReview, loading };
};

export const useIssueReturn = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const postIssueReturn = async (data: unknown) => {
    if (!loading) {
      setLoading(true);
      try {
        // const req = await axios.post(`http://localhost:3001/api/return/`, data, config);
        const req = await postData(`/return/`, data, config);

        toast.success("Return request submitted successfully");
        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        console.log(err);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getReturnRequests = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData(`/return/`, config);
        return req.data.message;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getReturnRequest = async (id: string) => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData(`/return/${id}`, config);
        return req.data.message;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };
  return { postIssueReturn, loading, getReturnRequests, getReturnRequest };
};

export const useUpdates = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const getFeeds = async (type: string, cursor?: string) => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData(
          `/updates/${type}?cursor=${cursor}&limit=${ITEMS_TO_APPEND}`,
          config,
        );

        return req.data.message;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const addComments = async (data: {
    feedId: string;
    type: string;
    comment: string;
    parentId?: string;
  }) => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await postData(
          `/updates/comment`,
          {
            id: data.feedId,
            comment: data.comment,
            parentId: data.parentId,
            type: data.type,
          },
          config,
        );
        return req.data.data;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const likeUpdate = async (data: { feedId: string; type: string }) => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await postData(
          `/updates/like`,
          { id: data.feedId, type: data.type },
          config,
        );

        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const likeUpdateComment = async (data: {
    feedId: string;
    commentId: string;
    type: string;
  }) => {
    if (!loading) {
      setLoading(true);
      try {
        let req = await postData(
          `/updates/likeComment`,
          { id: data.feedId, commentId: data.commentId, type: data.type },
          config,
        );
        console.log(req.data.message);
        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteUpdateComment = async (data: {
    feedId: string;
    commentId: string;
    type: string;
  }) => {
    if (!loading) {
      setLoading(true);

      try {
        let req = await deleteData(
          `/updates/comment/${data.type}/${data.feedId}/${data.commentId}`,
          config,
        );

        return true;
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };
  return {
    getFeeds,
    loading,
    addComments,
    likeUpdate,
    likeUpdateComment,
    deleteUpdateComment,
  };
};

export const useNotification = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const getNotifications = async () => {
    try {
      setLoading(true);
      const req = await getData(`/notification/`, config);

      return req.data.message;
    } catch (err) {
      let message;
      if (err instanceof AxiosError) {
        message = err.response?.data?.error || "Request failed";
      } else {
        message = "Something went wrong.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotificationFromDb = async (id: string) => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await deleteData(`/notification/${id}`, config);
        return req.data.message;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const markAsReadFromDb = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await postData(`/notification/markAsRead`, {}, config);

        return req.data.message;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const updatePushToken = async (pushToken: string) => {
    if (!loading) {
      setLoading(true);
      try {
        await postData(
          `/notification/savePushToken`,
          { token: pushToken },
          config,
        );
        return true;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };
  return {
    loading,
    getNotifications,
    deleteNotificationFromDb,
    markAsReadFromDb,
    updatePushToken,
  };
};

export const useExploreInterest = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const getExploreInterest = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData(`/products/explore/`, config);
        return req.data.message;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const addProductToBrowsingHistory = async (productId: string) => {
    try {
      await postData(`/products/browsing-history`, { productId }, config);
    } catch (err) {
      let message;
      if (err instanceof AxiosError) {
        message = err.response?.data?.error || "Request failed";
      } else {
        message = "Something went wrong.";
      }
      toast.error(message);
    }
  };

  return { loading, getExploreInterest, addProductToBrowsingHistory };
};

export const useBrowsingHistory = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [uiLoading, setUILoading] = useState<boolean>(true);

  const getBrowsingHistory = async (cursor: string, limit: number) => {
    if (!loading) {
      setUILoading(true);
      try {
        const req = await getData(
          `/browsing-history?limit=${limit}&cursor=${cursor}`,
          config,
        );
        return req.data.message;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setUILoading(false);
      }
    }
  };

  const deleteBrowsingHistory = async (ids: string[]) => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await deleteData(`/browsing-history?ids=${ids}`, config);
        return req.data.message;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearBrowsingHistory = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await deleteData(`/browsing-history`, config);
        return req.data.message;
      } catch (err) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    loading,
    getBrowsingHistory,
    uiLoading,
    deleteBrowsingHistory,
    clearBrowsingHistory,
  };
};
