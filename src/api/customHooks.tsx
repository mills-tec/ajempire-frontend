"use client";
import { API_URL, getBearerToken } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import { ITEMS_TO_APPEND } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { deleteData, getData, postData, updateData } from "./api";



export const useOrders = () => {
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
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
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
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

  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }


  const [loading, setLoading] = useState<boolean>(false);

  const postIssueReturn = async (data: unknown) => {
    if (!loading) {
      setLoading(true);
      try {
         await axios.post(`${API_URL}/return`, data, config);

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

  const getReturnRequests = async (): Promise<{ status: boolean; message: any }> => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData(`/return/`, config);
        return {
          status: true,
          message: req.data.message
        }
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
        return {
          status: false,
          message
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Action is loadig...");

      return {
        status: false,
        message: "Still loading!"
      }
    }
  };

  const getReturnRequest = async (id: string): Promise<
    {
      status: boolean;
      message: any
    }> => {
    if (!loading) {
      setLoading(true);
      try {
        const req = await getData(`/return/${id}`, config);
        return {
          status: true,
          message: req.data.message
        };
      } catch (err: unknown) {
        let message;
        if (err instanceof AxiosError) {
          message = err.response?.data?.error || "Request failed";
        } else {
          message = "Something went wrong.";
        }
        toast.error(message);
        return {
          status: false,
          message
        }
      } finally {
        setLoading(false);
      }
    } else {

      return { status: false, message: "Loading" }
    }

  };
  return { postIssueReturn, loading, getReturnRequests, getReturnRequest };
};

export const useUpdates = () => {
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
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
        console.log(message);
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
        console.log(data.feedId, data.type);
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
        const req = await postData(
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
        const req = await deleteData(
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
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
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
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
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

  // const addProductToBrowsingHistory = async (productId: string) => {
  //   try {
  //     const token = getBearerToken();
  //     if (!token) return;
  //     const freshConfig = { headers: { Authorization: `Bearer ${token}` } };
  //     await postData(`/products/browsing-history`, { productId }, freshConfig);
  //   } catch (err) {
  //     let message;
  //     if (err instanceof AxiosError) {
  //       message = err.response?.data?.error || "Request failed";
  //     } else {
  //       message = "Something went wrong.";
  //     }
  //     toast.error(message);
  //   }
  // };

  return { loading, getExploreInterest };
};

export const useBrowsingHistory = () => {
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  const [loading, setLoading] = useState<boolean>(false);
  const [uiLoading, setUILoading] = useState<boolean>(true);

  const getBrowsingHistory = async (cursor: string, limit: number) => {
    setUILoading(true);
    try {
      const token = getBearerToken();
      const freshConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const req = await getData(
        `/browsing-history?limit=${limit}&cursor=${cursor}`,
        freshConfig,
      );
      return req.data.message;
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("[BrowsingHistory] error:", err.response?.status, err.response?.data);
        if (err.response?.status === 401) {
          return null;
        }
        const message = err.response?.data?.error || "Request failed";
        toast.error(message);
      } else {
        toast.error("Something went wrong.");
      }
      return null;
    } finally {
      setUILoading(false);
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

export const useProduct = () => {
  let config = {};
  const token = getBearerToken();
  if (token) {
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  const { searchByImageLoading, setSearchByImageLoading } = useSearchStore();

  const searchByImage = async (image: File) => {
    if (!searchByImageLoading) {
      setSearchByImageLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", image);
        const req = await postData(`/product/searchbyImage`, formData, config);
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
        setSearchByImageLoading(false);
      }
    }
  };

  return { searchByImageLoading, searchByImage };
};
